package com.bokesoft.yigo2.service.heel.sample.paper;

import java.math.BigDecimal;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bokesoft.yigo.mid.base.DefaultContext;
import com.bokesoft.yigo.mid.connection.IDBManager;
import com.bokesoft.yigo.mid.document.LoadData;
import com.bokesoft.yigo.mid.document.SaveData;
import com.bokesoft.yigo.mid.service.IExtService;
import com.bokesoft.yigo.struct.datatable.DataTable;
import com.bokesoft.yigo.struct.document.Document;
import com.bokesoft.yigo2.service.heel.sample.StatusList;
import com.bokesoft.yigo2.service.heel.sample.common.Miscellaneous;

/**
 * @author guojs
 * 生成试题
 */
public class GenerateQuestions implements IExtService {
	protected class PaperInfo { // 试卷信息
		public Long _statusId = 0L;
		public Long _ruleId = 0L;
	};
	
	protected class GenerateRule { // 题型规则
		public Long _typeId = 0L;
		public String _typeCode = "";
		public String _typeName = "";
		public Integer _count = 0;
		public BigDecimal _score = new BigDecimal(0);
	};

	protected class Rules { // 总体规则
		public Long _categoryId = 0L;
		public String _categoryCode = "";
		public Long _departmentId = 0L;
		public String _departmentCode = "";
		public ArrayList<GenerateRule> _rules = new ArrayList<GenerateRule>();
	};
	
	protected class Question { // 题目
		public Long _id;
		public String _code;
		public String _question; // 内容
		public String _options; // 备选项
		public String _answer; // 答案
		public Long _typeId; // 题型
		public Integer _isMandatory; // 是否必考
	}

	Logger _logger = LoggerFactory.getLogger("com.bokesoft.yigo2.service.heel.sample.paper.GenerateQuestions");
	protected DefaultContext _ctx = null;

	@Override
	public Object doCmd(DefaultContext arg0, ArrayList<Object> arg1) throws Throwable {
		_logger.info("Generate questions.");
		_ctx = arg0;
		
		// Check input
		if (arg1.size() != 1) {
			throw new Exception("Need 1 parameters. size=" + arg1.size());
		}
		
		Long id = Long.parseLong((String) arg1.get(0));
		_logger.info("id=" + id);
		if (id <= 0) {
			throw new Exception("Invalid paper id.");
		}

		generate(id);
		
		return null;
	}

	protected void generate(Long id) throws Throwable {
		PaperInfo info = getInfo(id);
		_logger.info("statusId=" + info._statusId);
		_logger.info("ruleId=" + info._ruleId);
		if (info._statusId.intValue() != StatusList.getInstance().itemId("PREPARED")) {
			throw new Exception("Paper status should be PREPARED.");
		}
		
		Rules rules = getRules(info._ruleId);
		_logger.info("rule info:");
		_logger.info("category id:" + rules._categoryId);
		_logger.info("category code:" + rules._categoryCode);
		_logger.info("department id:" + rules._departmentId);
		_logger.info("department code:" + rules._departmentCode);
		for(int i = 0; i < rules._rules.size(); i++) {
			_logger.info("rule:" + i);
			_logger.info("type id:" + rules._rules.get(i)._typeId);
			_logger.info("type code:" + rules._rules.get(i)._typeCode);
			_logger.info("type name:" + rules._rules.get(i)._typeName);
			_logger.info("count:" + rules._rules.get(i)._count);
			_logger.info("score:" + rules._rules.get(i)._score);
		}
		
		// 筛选题库中匹配的试题
		ArrayList<Question> questions = getQuestions(rules);
		_logger.info("Questions count = " + questions.size());
		
		// 按照顺序抽取试题
		ArrayList<Question> selectedQuestion = generate(rules, questions);
		_logger.info("Selected questions count = " + selectedQuestion.size());		
		
		// 删除以前生成的试题
		remove(id);
		
		// 保存试题
		save(id, selectedQuestion);
		
		// update flag
		updateFlag(id);
	}		
	
	protected PaperInfo getInfo(Long id) throws Throwable { // 选择的规则
		IDBManager dbm = _ctx.getDBManager();
		DataTable result = null;
		String sql = "select status, ruleid from ts_exam_paper_header where oid=? and IsDeleted = 0";

		try {
			result = dbm.execPrepareQuery(sql, id);
			if (result.size() != 1) {
				throw new Exception("未能找到指定试卷有效对应的生成规则");
			}
			result.beforeFirst();
			result.next();
			PaperInfo info = new PaperInfo();
			info._statusId = result.getLong("status");
			info._ruleId = result.getLong("ruleid");
			
			return info;
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

	protected Rules getRules(Long id) throws Throwable { // 获取规则详情
		Rules result = new Rules();
		IDBManager dbm = _ctx.getDBManager();
		GenerateRule rule = null;
		DataTable tempResult = null;
		String sql = null; 
		Integer statusEnabledId = StatusList.getInstance().itemId("ENABLED");

		try {
			// Header
			sql ="select header.Category, cat.code CategoryCode, header.Department, dep.code DepartmentCode"
					+ " from ts_exam_rule_header header"
					+ " left join md_enum cat on cat.OID = header.Category"
					+ " left join md_enum dep on dep.OID = header.Department"
					+ " where"
					+ " (header.IsDeleted = 0)"
					+ " and (header.status = "+ statusEnabledId +")"
					+ " and (header.OID = ?)";			
			tempResult = dbm.execPrepareQuery(sql, id);
			if (tempResult.size() != 1) {
				throw new Exception("没有找到匹配的有效生成规则记录");
			}
			tempResult.beforeFirst();
			tempResult.next();
			result._categoryId = tempResult.getLong("Category");
			result._categoryCode = tempResult.getString("CategoryCode");
			result._departmentId = tempResult.getLong("Department");
			result._departmentCode = tempResult.getString("DepartmentCode");
			
			// Rules
			sql = "select detail.type, types.code typeCode, types.name typeName, detail.Count, detail.Score"
					+ " from ts_exam_rule_detail detail"
					+ " left join md_enum types on types.OID = detail.type"
					+ " where"
					+ " detail.SOID = ?"
					+ " order by detail.seq"; 
			tempResult = dbm.execPrepareQuery(sql, id);
			if (tempResult.size() <= 0) {
				throw new Exception("没有详细规则记录");
			}
			tempResult.beforeFirst();
			while (tempResult.next()) {
				rule = new GenerateRule();
				rule._typeId = tempResult.getLong("type");
				rule._typeCode = tempResult.getString("typeCode");
				rule._typeName = tempResult.getString("typeName");
				rule._count = tempResult.getInt("Count");
				rule._score = tempResult.getNumeric("Score");
				
				result._rules.add(rule);
			}
			
			return result;
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			sql = null;
			rule = null;
			result = null;
			if (tempResult != null) {
				tempResult.close();
				tempResult = null;
			}
		}		
	}

	protected ArrayList<Question> getQuestions(Rules rules) throws Throwable { // 选择的规则
		ArrayList<Question> result = new ArrayList<Question>();
		IDBManager dbm = _ctx.getDBManager();
		DataTable tempResult = null;
		Question question = null;
		Integer statusEnabledId = StatusList.getInstance().itemId("ENABLED");
		String sql = "select oid, no, question, options, answer, type, IsMandatory"
				+ " from"
				+ " ts_exam_question_header"
				+ " where"
				+ " (category=?)"
				+ " and (department=?)"
				+ " and (status =" + statusEnabledId + ")"
				+ " and (IsDeleted = 0)"; 

		try {
			tempResult = dbm.execPrepareQuery(sql, rules._categoryId, rules._departmentId);
			if (tempResult.size() <= 0) {
				throw new Exception("未能找到匹配要求的试题");
			}
			tempResult.beforeFirst();
			while (tempResult.next()) {
				question = new Question();
				question._id = tempResult.getLong("oid");
				question._code = tempResult.getString("no");
				question._question = tempResult.getString("question");
				question._options = tempResult.getString("options");
				question._answer = tempResult.getString("answer");
				question._typeId = tempResult.getLong("type");
				question._isMandatory = tempResult.getInt("IsMandatory");
				
				result.add(question);
			}
			
			return result;
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			sql = null;
			question = null;
			result = null;
			if (tempResult != null) {
				tempResult.close();
				tempResult = null;
			}
		}		
	}

	protected void remove(Long id) throws Throwable { // 删除以前生成的试题
		IDBManager dbm = _ctx.getDBManager();
		String sql = "delete from ts_exam_paper_detail where soid=" + id;

		try {
			dbm.execUpdate(sql);
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			sql = null;
		}
	}
	
	protected ArrayList<Question> generate(Rules rules, ArrayList<Question> questions) throws Throwable { // 生成规则
		ArrayList<Question> result = new ArrayList<Question>();
		ArrayList<Question> questionIsMandatory = new ArrayList<Question>();
		ArrayList<Question> questionAlternate = new ArrayList<Question>();
		Integer index;
		
		// 遍历规则，按照顺利生成试题
		for (int i = 0; i < rules._rules.size(); i++ ) {
			GenerateRule rule = rules._rules.get(i);
			Long typeId = rule._typeId;
			String typeName = rule._typeName;
			Integer count = rule._count;
			
			// 符合指定题型的备选题型初始化为两组，必选和可选
			questionIsMandatory.clear();
			questionAlternate.clear();
			for (int j = 0; j < questions.size(); j++) {
				Question question = questions.get(j);
				if (question._typeId.equals(typeId)) { // 题型匹配
					if (question._isMandatory == 1) { // 必选题
						questionIsMandatory.add(question);
					} else { // 备选题
						questionAlternate.add(question);
					}
				}
			}
			
			// 随机选题
			while (count > 0) { // 数量满了就结束
				Question selectedQuestion;
				if (questionIsMandatory.size() > 0) { // 先必选题
					index = Miscellaneous.randomInt(0, questionIsMandatory.size());
					selectedQuestion = questionIsMandatory.get(index); 
					result.add(selectedQuestion);
					questionIsMandatory.remove(selectedQuestion);
				} else if (questionAlternate.size() > 0) { // 后被选题
					index = Miscellaneous.randomInt(0, questionAlternate.size());
					selectedQuestion = questionAlternate.get(index); 
					result.add(selectedQuestion);
					questionAlternate.remove(selectedQuestion);					
				} else { // 没有题了
					throw new Exception("【" + typeName + "】数量不足，无法生成试卷");					
				}
								
				count--;
			}
		}
		
		questionIsMandatory = null;
		questionAlternate = null;
		return result;
	}
	
	protected void save(Long id, ArrayList<Question> questions) throws Throwable { // 保存
		// Load
		LoadData load = new LoadData("TS_ExamPaper", id); // 此处应该填写数据源名称
		Document doc = load.load(_ctx, null);
		
		// Add questions
		DataTable detail = doc.get("TS_EXAM_PAPER_DETAIL"); // 选中试题清单
		detail.clear();
		for (int i = 0; i < questions.size(); i++) {
			Question question = questions.get(i);
			int row = detail.append();
			
			detail.setLong(row, "OID", _ctx.applyNewOID());
			detail.setLong(row, "Seq", (long)i);
			detail.setLong(row, "QuestionId", question._id);
			detail.setString(row, "QuestionCode", question._code);
			detail.setString(row, "Question", question._question);
			detail.setString(row, "QuestionOptions", question._options);
			detail.setString(row, "QuestionAnswer", question._answer);
			detail.setLong(row, "QuestionType", question._typeId);
		}
		
		// Update Header
		DataTable header = doc.get("TS_EXAM_PAPER_HEADER"); // 试卷基本信息
		header.setInt("IsQuestionsGenerated", 1); // 说明试卷已经生成

		// Save
		SaveData saveData = new SaveData("TS_ExamPaper", null, doc);
		saveData.save(_ctx);
	}
	
	protected void updateFlag(Long id) throws Throwable { // 更新标志
		IDBManager dbm = _ctx.getDBManager();
		Long userId = _ctx.getEnv().getUserID();
		String sql = "update ts_exam_paper_header "
				+ "set modifier=" + userId + ", modifytime=now(), verid=verid+1 "
				+ "where oid=" + id + " and status=" + StatusList.getInstance().itemId("PREPARED") + " "
				+ "and isdeleted=0";		

		try {
			dbm.execUpdate(sql);
		} catch(Exception e) {
			throw e;
		} finally {
			dbm = null;
			userId = null;
			sql = null;
		}	
	}	
}
