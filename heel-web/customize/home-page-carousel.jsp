<%@page import="org.json.JSONArray"%>
<%@page import="org.json.JSONObject"%>
<%@page import="com.bokesoft.yigo.struct.datatable.DataTable"%>
<%@page import="com.bokesoft.yigo.mid.base.DefaultContext"%>
<%@page import="com.bokesoft.yigo.mid.util.ContextBuilder"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>

<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	Logger logger = LoggerFactory.getLogger("Home Page Carousel");
	logger.info("Start of Home Page Carousel Routine(" + request.getMethod() + ") =================================");

	JSONArray pics = new JSONArray();
	DefaultContext ctx = null;
	DataTable rs = null;
	String sql = null;
	String url_prefix = null;
	
	try{
		// Check
		
		// Initialize
		ctx = ContextBuilder.create();
		url_prefix = "http://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath() + "/upload/";
		
		// Get paper information
		sql = "select code, name, value from md_enum where type='首页-轮播图' order by name";
		rs = ctx.getDBManager().execPrepareQuery(sql, new Object[] {});
		if (0 < rs.size()) {
			rs.beforeFirst();
			while (rs.next()) {
				// Add pic
				pics.put(url_prefix + rs.getString("value"));
			}
		}		
		
		// result
		out.clear();
		out.print(pics.toString());
	}catch(Throwable e){
		logger.info(e.toString()); 
		out.clear();
		out.print(pics.toString());
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
		
		pics = null;
		rs = null;
		sql = null;
		url_prefix = null;

		logger.info("End of Home Page Carousel Routine =================================");
	}
%>
