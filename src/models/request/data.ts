// tslint:disable
export class LoginInput {
  public email!: string;
  public password!: string;
}

export class RegisterInput {
  public username!: string;
  public email!: string;
  public password!: string;
  // public scope!: [string];
  // public avatar!: string;
  public phone!: string;
  public fullname!: string;
  public address!: string;
}

export class ResponseResult {
  public data: object = [];
  public message!: string;
  public status: number = 1;
  public error!: boolean;
  public errorCode!: number;
}

export class UserInput {
  public avatar!: string;
  public email!: string;
  public fullname!: string;
  public password!: string;
  public phone!: string;
  public dob!: number;
  public address!: string;
  public username!: string;
}

