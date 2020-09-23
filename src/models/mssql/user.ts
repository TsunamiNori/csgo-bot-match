import * as bcrypt from "bcrypt-nodejs";
import {BeforeInsert, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {SALT_SECRET} from "../../common/constants";

/* tslint:disable */
@Entity("users")
export class Users {

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public avatar!: string;
  @Column()
  public email!: string;
  @Column()
  public fullname!: string;
  @Column()
  public password!: string;
  @Column()
  public phone!: string;
  @Column()
  public dob!: number;
  @Column()
  public address!: string;
  @Column()
  public uid!: string;
  @Column()
  public username!: string;
  @Column()
  public enable!: number;

  @BeforeInsert()
  private async preSave(): Promise<any> {
    const promise = new Promise((resolve, reject): any => {
      bcrypt.genSalt(SALT_SECRET, async (err: Error, salt: string): Promise<any> => {
        if (err) {
          reject(err);
        }
        bcrypt.hash(this.password, salt, null, (error: Error, hash): any => {
          if (error) {
            reject(err);
          }
          resolve(hash);
        });
      });
    });
    const check = await promise;
    if (check) {
      this.password = check as string;
    } else {
      throw new Error("Can not process password before saving!");
    }
    // console.log(this);
    // this.password = await bcrypt.hash(this.password, 10);
  }
}
