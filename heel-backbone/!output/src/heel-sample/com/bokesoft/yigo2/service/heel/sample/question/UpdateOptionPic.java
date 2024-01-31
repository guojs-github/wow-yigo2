package com.bokesoft.yigo2.service.heel.sample.question;

import java.sql.Array;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo.struct.datatable.DataTable;
import com.bokesoft.yigo2.service.heel.sample.AttachmentType;

/**
 * 刷新试题选项图片信息
 * Created by guojs 2023/4/18
 */
public class UpdateOptionPic implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.question.UpdateOptionPic");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Update question option picture.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 2) {
			throw new Exception("Need 2 parameters. size=" + arg1.size());
		}
		
		// 第1个参数，无意义
		// _logger.info("argument 1=" + arg1.get(0));
		
		// 第2个参数，试题ID
		_logger.info("argument 2=" + arg1.get(1));
		Long id = Long.parseLong((String)arg1.get(1));
		if (id <= 0) {
			throw new Exception("Invalid file id.");
		}
		
		JSONArray pics = get_pics(id);
		bind_attachment(pics);
		unbind_attachment(pics);

		return null;
	}
	
	protected JSONArray get_pics(Long id) throws Throwable { // 搜索试题下所有选项记录
		JSONArray result = new JSONArray();
		IDBManager dbm = _ctx.getDBManager();
		DataTable dt = null;
		String sql = "select oid, pictureid from TS_EXAM_QUESTION_OPTION where soid=?";
		
		try {
			dt = dbm.execPrepareQuery(sql, id);
			if (dt.size() <= 0) {
				return result; 
			}
			dt.beforeFirst();
			while (dt.next()) {
				JSONObject row = new JSONObject();
				row.put("option_id", dt.getLong("oid"));
				row.put("picture_id", dt.getLong("pictureid"));
				
				result.add(row);
			}			
			
			return result;
		} finally {
			result = null;
			dbm = null;
			if (dt != null) {
				dt.close();
				dt = null;
			}
		}
	}

	protected void bind_attachment(JSONArray pics) throws Throwable { // 更新附件关联
		// check
		if (pics.size() <=0) {
			return;
		}
		
		// update
		IDBManager dbm = _ctx.getDBManager();
		String ref_type = AttachmentType.QUESTION_OPTION_PIC;
		String sql = null;
		try {
			for (int i = 0; i < pics.size(); i++) {
				JSONObject row = pics.getJSONObject(i);
				Long option_id = row.getLong("option_id");
				Long picture_id = row.getLong("picture_id");
				
				if (picture_id <= 0) { // no picture
					continue;
				}
				
				sql = "update md_attachment "
						+ "set reftype='" + ref_type + "', refid=" + option_id + ", verid=verid+1 "
						+ "where oid =" + picture_id;				
				dbm.execUpdate(sql);
			}			
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			ref_type = null;
			sql = null;
		}		
	}
	
	protected void unbind_attachment(JSONArray pics) throws Throwable { // Reset已经与从视图中删除的图片附件
		// check
		if (pics.size() <=0) {
			return;
		}
		
		// update
		IDBManager dbm = _ctx.getDBManager();
		String ref_type = AttachmentType.QUESTION_OPTION_PIC;
		String sql = null;
		try {
			for (int i = 0; i < pics.size(); i++) {
				JSONObject row = pics.getJSONObject(i);
				Long option_id = row.getLong("option_id");
				Long picture_id = row.getLong("picture_id");
				
				if (picture_id > 0) { // don't remove the picture
					continue;
				}
				
				sql = "update md_attachment "
						+ "set reftype='', refid=-1, verid=verid+1 "
						+ "where reftype ='" + ref_type + "' and refid=" + option_id;				
				dbm.execUpdate(sql);
			}
			
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			ref_type = null;
			sql = null;
		}		
	}
}
