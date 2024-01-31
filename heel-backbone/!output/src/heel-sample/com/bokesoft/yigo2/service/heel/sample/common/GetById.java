package com.bokesoft.yigo2.service.heel.sample.common;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo.struct.datatable.DataTable;

/**
 * @author guojs
 * 按照指定id获取指定表中的指定字段信息
 */
public class GetById implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.common.GetById");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Get data by id.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 3) {
			throw new Exception("Need 3 parameters. size=" + arg1.size());
		}
		
		// OID
		Long id = Long.parseLong((String) arg1.get(0));
		_logger.info("id=" + id);
		if (id <= 0) {
			throw new Exception("Invalid data id.");
		}
		
		// Source table name
		String tableName = ((String) arg1.get(1)).trim();
		_logger.info("tableName=" + tableName);
		if (tableName.length() <= 0) {
			throw new Exception("Invalid source table name.");
		}
		
		// Field name
		String fieldName = ((String) arg1.get(2)).trim();
		_logger.info("fieldName=" + fieldName);
		if (fieldName.length() <= 0) {
			throw new Exception("Invalid field name.");
		}		
		
		return get(id, tableName, fieldName);
	}
	
	protected String get(Long id, String tableName, String fieldName) throws Throwable { // Get data
		IDBManager dbm = _ctx.getDBManager();
		DataTable result = null;
		String sql = "select " + fieldName + " from " + tableName + " where oid=?";

		try {
			result = dbm.execPrepareQuery(sql, id);
			if (result.size() != 1) {
				return ""; 
			}
			result.beforeFirst();
			result.next();
			String data = (String) result.getObject(fieldName);
			
			return data;
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			sql = null;
			if (result != null) {
				result.close();
				result = null;
			}
		}		
	}	
}
