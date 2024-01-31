/**
 * 
 */
package com.bokesoft.yigo2.service.heel.sample.question;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.document.LoadData;
import com.bokesoft.yigo.mid.document.SaveData;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo.struct.datatable.DataTable;
import com.bokesoft.yigo.struct.document.Document;
import com.bokesoft.yigo2.service.heel.sample.StatusList;

/**
 * @author guojs
 * 设置试题状态
 */
public class SetStatus implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.question.SetStatus");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Question set status.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 2) {
			throw new Exception("Need 2 parameters. size=" + arg1.size());
		}
		
		String idList = (String) arg1.get(0);
		_logger.info("idList=" + idList);
		if (idList.trim().length() <= 0) {
			throw new Exception("Invalid question id list.");
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
	
//	protected void setStatus(Long id, Integer newStatusId) throws Throwable { // 更新状态, 好像在一次过程中无法多次调用
//		// Load
//		LoadData load = new LoadData("TS_ExamQuestion", id); // 此处应该填写数据源名称
//		Document doc = load.load(_ctx, null);
//		
//		// Update
//		DataTable header = doc.get("TS_EXAM_QUESTION_HEADER"); // 数据源中的表名称
//		header.setInt("Status", newStatusId);
//
//		// Save
//		SaveData saveData = new SaveData("TS_ExamQuestion", null, doc);
//		saveData.save(_ctx);
//	}
	
	protected void enable(String[] ids) throws Throwable { // 启用
		IDBManager dbm = _ctx.getDBManager();
		Long userId = _ctx.getEnv().getUserID();
		Integer statusEnabledId = StatusList.getInstance().itemId("ENABLED");
		Integer statusPreparedId = StatusList.getInstance().itemId("PREPARED");
		Integer statusDisabledId = StatusList.getInstance().itemId("DISABLED");
		String sql = "update ts_exam_question_header "
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
		String sql = "update ts_exam_question_header "
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
