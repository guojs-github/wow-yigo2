package com.bokesoft.yigo2.service.heel.sample;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import java.io.File;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * created by guojs on 2023/4/10
 */
@SuppressWarnings("serial")
public class UploadFile extends HttpServlet {
	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.UploadFile");

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
		this.upload(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
		this.upload(request, response);
    }
    
    /*
     * upload file
     * created by guojs on 2023/4/10
     */
    protected void upload(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    	String result = "";
    	String source_file = "";
    	String target_file = "";
    	String path = "/upload";
    	
        DiskFileItemFactory fac = new DiskFileItemFactory(); // 可设置缓存大小和临时文件存储未知
        ServletFileUpload upload = new ServletFileUpload(fac);
        upload.setHeaderEncoding("UTF-8"); // 处理上传文件的路径中文乱码
        /*
        upload.setFileSizeMax(10 * 1024 * 1024); // 设置单个文件上传大小
        upload.setSizeMax(100 * 1024 * 1024); // 设置总上传文件大小
        */

        if (ServletFileUpload.isMultipartContent(request)) {
            try {
                List<FileItem> list = upload.parseRequest(request); // 将请求数据流转换为文件数据清单
                for (FileItem item : list) {
                    if (item.isFormField()) { // 判断该数据项是否为文件上传项，true 不是文件上传 false 是文件上传
                        String fileName = item.getFieldName();
                        String value = item.getString("UTF-8");
                        _logger.info("Form data, " + fileName + ":" + value);
                    } else {
                    	// upload file
                    	//为了避免上传文件重名，在前面拼接一个随机串
                    	source_file = item.getName();
                        SimpleDateFormat ft = new SimpleDateFormat("yyyyMMddhhmmsssss");
                        target_file = ft.format(new Date()) + "-" + source_file;

                        //上传文件放在一个统一的目录
                        String realPath = getServletContext().getRealPath(path);
                        File uploadDir = new File(realPath);
                        if (!uploadDir.exists() && !uploadDir.isDirectory()) {
                            uploadDir.mkdirs();
                            _logger.info("Create data upload directory: " + realPath);
                        } else {
                        	_logger.info("Data upload directory: " + realPath + " exists!");
                        }
                        File file = new File(realPath, target_file);
                        item.write(file);
                        _logger.info("File " + item.getName() + " upload to " +file.getAbsolutePath());

                        item.delete();
                        result = "OK";
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
        	_logger.info("Invalid format, nop!");
        }        
        
        // Send response
        sendResponse(response, result, source_file, path + "/" + target_file);
    }
    
    protected void sendResponse(
    		HttpServletResponse response, 
    		String result, 
    		String file_name, 
    		String url) throws IOException {
        PrintWriter out = response.getWriter();

        JSONObject data = new JSONObject();
        data.put("result", result);
        if (result.equals("OK")) {
            data.put("file_name", file_name);
            data.put("url", url);        	
        }

        out.println(data);
    }
}
