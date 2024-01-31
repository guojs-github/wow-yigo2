package com.bokesoft.yigo2.service.heel.sample.paper;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo.struct.datatable.DataTable;

/**
 * @author guojs
 * 判断试卷是否逻辑删除
 */
public class IsDeleted implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.paper.IsDeleted");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Paper is deleted？");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 1) {
			throw new Exception("Need 1 parameters. size=" + arg1.size());
		}
		
		Integer id = Integer.parseInt((String) arg1.get(0));
		_logger.info("id=" + id);
		if (id <= 0) {
			throw new Exception("Invalid paper id.");
		}
		
		return isDeleted(id);
	}

	protected boolean isDeleted(Integer id) throws Throwable { // Paper is deleted?
		IDBManager dbm = _ctx.getDBManager();
		DataTable result = null;
		String sql = "select isdeleted from ts_exam_paper_header where oid=? ";

		try {
			result = dbm.execPrepareQuery(sql, id);
			if (result.size() != 1) {
				return true; 
			}
			result.beforeFirst();
			result.next();
			Integer isDeleted = result.getInt("isdeleted");
			
			return isDeleted == 0 ? false : true;
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
