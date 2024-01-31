package com.bokesoft.yigo2.service.heel.sample.attachment;

import java.util.ArrayList;
import java.util.Calendar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.document.SaveData;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo2.service.heel.sample.StatusList;

import com.bokesoft.yigo.meta.dataobject.MetaDataObject;
import com.bokesoft.yigo.struct.datatable.DataTable;
import com.bokesoft.yigo.struct.document.Document;
import com.bokesoft.yigo.tools.document.DocumentUtil;

/**
 * 绑定附件删除试题
 * 2023/4/12 created by guojs
 */
public class Add implements IExtService {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.attachment.Add");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Add attachment.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 2) {
			throw new Exception("Need 2 parameters. size=" + arg1.size());
		}
		
		// 第1个参数，无意义
		// _logger.info("argument 1=" + arg1.get(0));
		
		// 第2个参数，待绑定的文件信息
		// _logger.info("argument 2=" + arg1.get(1));
		String str_files = (String)arg1.get(1);
		JSONArray files = JSONArray.parseArray(str_files);
		if (files.size() <= 0) {
			throw new Exception("Invalid file list.");
		}
		
		return this.add_attachments(files);
	}
	
	protected String add_attachments(JSONArray files) throws Throwable { // 添加附件
		ArrayList<Long> result = new ArrayList<Long>();
		Long user_id = _ctx.getEnv().getUserID();
		Calendar c = Calendar.getInstance();
		Integer enabled_status_id = StatusList.getInstance().itemId("ENABLED");
		MetaDataObject mdo = this._ctx.getVE().getMetaFactory().getDataObject("MD_Attachment");
		
		try {
			for (int i = 0; i < files.size(); i++) {
				JSONObject file = files.getObject(i, JSONObject.class);
				String file_name = file.getString("file_name");
				String url = file.getString("url");
				_logger.info("[file" + i + "] " + file_name + "," + url);
				
				// New
				Document newDoc = DocumentUtil.newDocument(mdo);
				newDoc.setNew();				
				DataTable table = newDoc.get("MD_Attachment");
				table.setLong("creator", user_id);
				table.setDateTime("createtime", c.getTime());
				table.setInt("status", enabled_status_id);
				table.setString("filename", file_name);
				table.setString("url", url);
				
				// Save
				SaveData saveData = new SaveData(mdo, null, newDoc);
				saveData.save(this._ctx);
				
				result.add(table.getLong("OID"));
			}
		} catch(Exception e) {
			throw e;
		} finally {
			user_id = null; c = null; enabled_status_id = null;
			mdo = null;
		}
		
		return result.toString();
	}
}
