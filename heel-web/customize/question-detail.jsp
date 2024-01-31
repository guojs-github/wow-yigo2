<%@page import="org.json.JSONArray"%>
<%@page import="org.json.JSONObject"%>
<%@page import="com.bokesoft.yigo.struct.datatable.DataTable"%>
<%@page import="com.bokesoft.yigo.mid.base.DefaultContext"%>
<%@page import="com.bokesoft.yigo.mid.util.ContextBuilder"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>

<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	Logger logger = LoggerFactory.getLogger("Question Detail");
	logger.info("Start of Question Detail Routine(" + request.getMethod() + ") =================================");

	JSONObject returnJson = new JSONObject();
	JSONArray questions = null;
	JSONObject question = null;
	String oid = request.getParameter("oid");
	DefaultContext ctx = null;
	DataTable rs = null;
	String sql = null;
	QuestionOptions options = new QuestionOptions(logger);
	
	try{
		// Check
		logger.info("oid:" + oid);
		if ((oid == null) || (0 >= oid.trim().length()) )
			throw new Exception("Invalid paper id");
		
		// Initialize
		ctx = ContextBuilder.create();
		
		// Get paper information
		sql = "select"
			+ "		pd.seq,	qh.oid,	qh.status, qh.no, qh.type as type_id, t.code as type_code, t.name as type_name,	qh.question, qh.answer,	qh.answertrueorfalse, qh.isdeleted"
			+ "	from" 
			+ "		ts_exam_question_header qh"
			+ "		join ts_exam_paper_detail pd on pd.questionId = qh.oid"
			+ "		left join md_enum t on t.OID = qh.type"
			+ "	where" 
			+ "		pd.soid = ?"
			+ "	order by" 
			+ "		pd.seq";
		rs = ctx.getDBManager().execPrepareQuery(sql, new Object[] { oid });
		if (0 < rs.size()) {
			questions = new JSONArray();
			rs.beforeFirst();
			while (rs.next()) {
				// question information
				question = new JSONObject();
				question.put("seq", rs.getInt("seq"));
				question.put("oid", rs.getInt("oid"));
				question.put("status", rs.getInt("status"));
				question.put("no", rs.getString("no"));
				question.put("type_id", rs.getInt("type_id"));
				question.put("type_code", rs.getString("type_code"));
				question.put("type_name", rs.getString("type_name"));
				question.put("question", rs.getString("question"));
				question.put("answer", rs.getString("answer"));
				question.put("answertrueorfalse", rs.getInt("answertrueorfalse"));
				question.put("isdeleted", rs.getInt("isdeleted"));
				question.put("options", options.query(rs.getInt("oid"))); // Get question options				
				
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
		
		returnJson = null; questions = null; question = null;
		rs = null;
		sql = null;
		options = null;

		logger.info("End of Question Detail Routine =================================");
	}
%>

<%!
	public class QuestionOptions {
		protected Logger _logger = null;
		
		public QuestionOptions(Logger logger) {
			_logger = logger;
		}
		
		public JSONArray query(Integer oid) throws Throwable {
			JSONArray opts = new JSONArray();
			JSONObject opt = null;
			DefaultContext ctx = null;
			DataTable rs = null;
			String sql = null;
			
			try{
				// Initialize
				ctx = ContextBuilder.create();
				
				// Get question options
				sql = "select"
					+ "		oid, soid, seq, title, IsAnswer, PictureId, Picture, PictureUrl"
					+ "	from"
					+ "		ts_exam_question_option"
					+ "	where"
					+ "		soid=?";
				rs = ctx.getDBManager().execPrepareQuery(sql, new Object[] { oid });
				if (0 < rs.size()) {
					rs.beforeFirst();
					while (rs.next()) {
						// option information
						opt = new JSONObject();
						opt.put("oid", rs.getInt("oid"));
						opt.put("soid", rs.getInt("soid"));
						opt.put("seq", rs.getString("seq"));
						opt.put("title", rs.getString("title"));
						opt.put("IsAnswer", rs.getInt("IsAnswer"));
						opt.put("PictureId", rs.getInt("PictureId"));
						opt.put("Picture", rs.getString("Picture"));
						opt.put("PictureUrl", "http://localhost:8089/yigo/" + rs.getString("PictureUrl"));
						
						// Add option
						opts.put(opt);
					}
				}			
				
				_logger.info(opts.toString());
				return opts;
			}catch(Throwable e){
				_logger.info(e.toString()); 
				throw e; // 抛出错误
			}finally{
				if (ctx != null) {
					try {
						ctx.close();
					} catch (Throwable e) {
						_logger.info(e.toString());
					} finally {
						ctx = null;
					}	
				}
				
				opts = null; opt = null;
				rs = null;
				sql = null;
			}
		}
	}
%>
