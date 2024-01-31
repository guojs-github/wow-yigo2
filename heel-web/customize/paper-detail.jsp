<%@page import="org.json.JSONArray"%>
<%@page import="org.json.JSONObject"%>
<%@page import="com.bokesoft.yigo.struct.datatable.DataTable"%>
<%@page import="com.bokesoft.yigo.mid.base.DefaultContext"%>
<%@page import="com.bokesoft.yigo.mid.util.ContextBuilder"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>

<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	Logger logger = LoggerFactory.getLogger("Paper Detail");
	logger.info("Start of Paper Detail Routine(" + request.getMethod() + ") =================================");

	JSONObject returnJson = new JSONObject();
	JSONObject header = null;
	JSONArray questions = null;
	JSONObject question = null;
	String oid = request.getParameter("oid");
	DefaultContext ctx = null;
	DataTable rs = null;
	String sql = null;
	
	try{
		// Check
		logger.info("oid:" + oid);
		if ((oid == null) || (0 >= oid.trim().length()) )
			throw new Exception("Invalid paper id");
		
		// Initialize
		ctx = ContextBuilder.create();
		
		// Get paper information
		sql = "select"
			+ "		h.no, h.category as cat_id, c.code as cat_code, c.name as cat_name, h.department as dep_id, d.code as dep_code, d.name as dep_name, h.remark, h.totalscore, h.passingscore, h.duration"
			+ "	from"
			+ "		ts_exam_paper_header h"
			+ "		left join md_enum c on c.oid = h.category"
			+ "		left join md_enum d on d.oid = h.department"
			+ "	where"
			+ "		h.oid = ?";
		rs = ctx.getDBManager().execPrepareQuery(sql, new Object[] { oid });
		if (1 != rs.size()) 
			throw new Exception("Paper not found！");
		header = new JSONObject();
		header.put("no", rs.getString("no"));
		header.put("cat_id", rs.getInt("cat_id"));
		header.put("cat_code", rs.getString("cat_code"));
		header.put("cat_name", rs.getString("cat_name"));
		header.put("dep_id", rs.getInt("dep_id"));
		header.put("dep_code", rs.getString("dep_code"));
		header.put("dep_name", rs.getString("dep_name"));
		header.put("remark", rs.getString("remark"));
		header.put("totalscore", rs.getInt("totalscore"));
		header.put("passingscore", rs.getInt("passingscore"));
		header.put("duration", rs.getInt("duration"));
		returnJson.put("header", header);
				
		// Get questions
		sql = "select"
			+ "		d.seq, d.QuestionId as id, d.questionType as type_id, t.code as type_code, t.name as type_name"
			+ "	from"
			+ "		ts_exam_paper_detail d"
			+ "		left join md_enum t on t.oid = d.QuestionType"
			+ "	where"
			+ "		d.soid = ?";
		rs = ctx.getDBManager().execPrepareQuery(sql, new Object[] { oid });
		if (0 < rs.size()) {
			questions = new JSONArray();
			rs.beforeFirst();
			while (rs.next()) {
				// question information
				question = new JSONObject();
				question.put("seq", rs.getInt("seq"));
				question.put("id", rs.getInt("id"));
				question.put("type_id", rs.getInt("type_id"));
				question.put("type_code", rs.getString("type_code"));
				question.put("type_name", rs.getString("type_name"));
				
				// Add question
				questions.put(question);
			}
			returnJson.put("questions", questions); // save to result object
		}		
		
		// result
		out.clear();
		out.print(returnJson.toString());
	}catch(Throwable e){
		logger.info(e.toString()); 
		returnJson = new JSONObject();
		out.clear();
		out.print(returnJson.toString());
	}finally{
		if (ctx != null) {
			try {
				ctx.close();
			} catch (Throwable e) {
				logger.info(e.toString());
	        } finally {
				ctx = null;
			}	
	    }
		
		returnJson = null; header = null; questions = null; question = null;
		rs = null;
		sql = null;

		logger.info("End of Paper Detail Routine =================================");
	}
%>