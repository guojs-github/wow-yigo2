package com.bokesoft.yigo2.service.heel.sample.rule;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo2.service.heel.sample.StatusList;

/**
 * @author guojs
 * 删除规则
 */
public class Delete implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.rule.Delete");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Delete rule.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 1) {
			throw new Exception("Need 1 parameters. size=" + arg1.size());
		}
		
		String idList = (String) arg1.get(0);
		_logger.info("idList=" + idList);
		if (idList.trim().length() <= 0) {
			throw new Exception("Invalid rule id list.");
		}
		
		// Update
		delete(idList);

		return null;
	}

	protected void delete(String idList) throws Throwable {
		remove(idList);
		removeLogically(idList);
	}	

	protected void remove(String idList) throws Throwable { // Remove data
		IDBManager dbm = _ctx.getDBManager();
		String[] ids = idList.split(","); 
		Integer preparedStatusId = StatusList.getInstance().itemId("PREPARED");
		String sql = "delete from ts_exam_rule_header "
				+ "where oid in (" + String.join(",", ids) +") and status =" + preparedStatusId;

		try {
			dbm.execUpdate(sql);
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			ids = null;
			sql = null;
		}		
	}

	protected void removeLogically(String idList) throws Throwable { // Set delete flag
		IDBManager dbm = _ctx.getDBManager();
		String[] ids = idList.split(","); 
		Integer disabledStatusId = StatusList.getInstance().itemId("DISABLED");
		Long userId = _ctx.getEnv().getUserID();
		String sql = "update ts_exam_rule_header "
				+ "set isdeleted=1, modifier=" + userId + ", modifytime=now(), verid=verid+1 "
				+ "where oid in (" + String.join(",", ids) +") and status =" + disabledStatusId;

		try {
			dbm.execUpdate(sql);
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			ids = null;
			sql = null;
		}		
	}

}
