package com.bokesoft.yigo2.service.heel.sample.paper;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo2.service.heel.sample.StatusList;

/**
 * @author guojs
 * 设置试题状态
 */
public class SetStatus implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.paper.SetStatus");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Paper set status.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 2) {
			throw new Exception("Need 2 parameters. size=" + arg1.size());
		}
		
		String idList = (String) arg1.get(0);
		_logger.info("idList=" + idList);
		if (idList.trim().length() <= 0) {
			throw new Exception("Invalid paper id list.");
		}
		
		boolean flag =  (Boolean) arg1.get(1);
		_logger.info("flag=" + flag); // true为启用，false为禁用

		// Update
		this.status(idList, flag);
		
		return null;
	}

	protected void status(String idList, boolean flag) throws Throwable {
		// Get id list
		String[] ids = idList.split(",");
		
		if (flag) { // 批量启用
			this.enable(ids);
		} else { // 批量停用
			this.disable(ids);
		}
	}

	protected void enable(String[] ids) throws Throwable { // 启用
		IDBManager dbm = _ctx.getDBManager();
		Long userId = _ctx.getEnv().getUserID();
		Integer statusEnabledId = StatusList.getInstance().itemId("ENABLED");
		Integer statusPreparedId = StatusList.getInstance().itemId("PREPARED");
		Integer statusDisabledId = StatusList.getInstance().itemId("DISABLED");
		String sql = "update ts_exam_paper_header "
				+ "set status=" + statusEnabledId + ", modifier=" + userId + ", modifytime=now(), verid=verid+1 "
				+ "where oid in (" + String.join(",", ids) + ") and status in (" + statusPreparedId + "," + statusDisabledId + ") "
				+ "and isdeleted = 0";		

		try {
			dbm.execUpdate(sql);
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			userId = null;
			sql = null;
		}	
	}

	protected void disable(String[] ids) throws Throwable { // 停用
		IDBManager dbm = _ctx.getDBManager();
		Long userId = _ctx.getEnv().getUserID();
		Integer statusEnabledId = StatusList.getInstance().itemId("ENABLED");
		Integer statusDisabledId = StatusList.getInstance().itemId("DISABLED");
		String sql = "update ts_exam_paper_header "
				+ "set status=" + statusDisabledId + ", modifier=" + userId + ", modifytime=now(), verid=verid+1 "
				+ "where oid in (" + String.join(",", ids) + ") and status in (" + statusEnabledId + ") "
				+ "and isdeleted = 0";		

		try {
			dbm.execUpdate(sql);
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			userId = null;
			sql = null;
		}	
	}	
}
