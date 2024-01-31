package com.bokesoft.yigo2.service.heel.sample.attachment;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo.struct.datatable.DataTable;

/**
 * 根据ID获取附件信息
 * 2023/4/18 created by guojs
 */
public class GetById implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.attachment.GetById");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Get attachment information.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 2) {
			throw new Exception("Need 2 parameters. size=" + arg1.size());
		}
		
		// 第1个参数，无意义
		// _logger.info("argument 1=" + arg1.get(0));
		
		// 第2个参数，附件ID
		_logger.info("argument 2=" + arg1.get(1));
		Long id = Long.parseLong((String)arg1.get(1));
		if (id <= 0) {
			throw new Exception("Invalid file id.");
		}
		
		return this.get(id);
	}
	
	protected String get(Long id) throws Throwable { // Get data
		IDBManager dbm = this._ctx.getDBManager();
		DataTable result = null;
		String sql = "select oid, status, no, creator, createtime, url, filename from md_attachment where oid=?";
		JSONObject data = new JSONObject();

		try {
			result = dbm.execPrepareQuery(sql, id);
			if (result.size() != 1) {
				return ""; 
			}
			result.beforeFirst();
			result.next();
			data.put("oid", result.getLong("oid"));
			data.put("status", result.getLong("status"));
			data.put("creator", result.getLong("creator"));
			data.put("createtime", result.getDateTime("createtime"));
			data.put("url", result.getString("url"));
			data.put("filename", result.getString("filename"));			
			
			return data.toString();
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			sql = null;
			if (result != null) {
				result.close();
				result = null;
			}
			data = null;
		}		
	}

}
