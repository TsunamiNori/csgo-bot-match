import {ResponseResult} from "../models/request/data";
import Helper from "../common/helper";
import ErrorCodes from "../common/error-codes";

export class BaseRepo {
	public Result(data: any = [], status = 1, error = false, errorCode = 0, message = ""): ResponseResult {
		const result = new ResponseResult();
		result.data = data;
		result.status = status;
		result.error = error;
		result.errorCode = errorCode;
		result.message = message;
		return result;
	}
	public NotFound(message = "NOT_FOUND"): ResponseResult {
		return this.Result([], 0, false, 0, message);
	}

	public Success(data: any = [], message = ""): ResponseResult {
		return this.Result(data, 0, false, 0, message);
	}

	public Failure(errorCode = 0, message = ""): ResponseResult {
		message = (typeof message !== "undefined" && message.length > 0) ? message : Helper.getObjectKey(ErrorCodes, errorCode);
		return this.Result([], 0, true, errorCode, message);
	}

}
