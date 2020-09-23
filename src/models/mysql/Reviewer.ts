import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

/* tslint:disable */
@Entity("reviewers")
export class Reviewer {
	@PrimaryGeneratedColumn()
	public id!: number;
	@Column()
	public group_num!: number;
	@Column()
	public email!: string;
	@Column()
	public permission!: number;
	@Column()
	public process_document_id!: number;
	@Column()
	public approval_id!: string;
	@Column()
	public status!: number;
	@Column()
	public created_at!: Date;
	@Column()
	public updated_at!: Date;
	@Column()
	public approved_at!: Date;
	@Column()
	public template_id!: number;
	@Column()
	public is_current_reviewer_on_process!: number;
	@Column()
	public avatar!: string;
	@Column()
	public group_chain_id!: number;
	@Column()
	public small_group_name!: string;

}
