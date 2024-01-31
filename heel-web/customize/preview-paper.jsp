<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>

<%@page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	Logger logger = LoggerFactory.getLogger("Preview Paper");
	logger.info("Start of preview-paper.jsp =================================");

	String oid = request.getParameter("oid"); logger.info("oid=" + oid);
	String url = "index.html#/preview-paper";
	Date now = new Date();
	SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	String nowStr = f.format(now); logger.info("now=" + nowStr);

	response.sendRedirect(url + "?oid=" + oid + "&now=" + nowStr);

	logger.info("end of preview-paper.jsp =================================");
%>