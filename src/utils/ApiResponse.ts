export class ApiResponse {
  success: boolean;
  message: string;
  data: object | null;

  constructor(success: boolean, message: string, data: any) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success(message: string, data: any) {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, data: any = null) {
    return new ApiResponse(false, message, data);
  }

}