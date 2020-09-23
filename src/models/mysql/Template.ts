import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Document} from "./Document";
import {SubCategory} from "./SubCategory";

/* tslint:disable */
@Entity("templates")
export class Template {

	@PrimaryGeneratedColumn()
	public id!: number;
	@Column()
	public title!: string;
	@Column()
	public type!: string;
	@Column()
	public connected_spreadsheet_file_name!: string;
	@Column()
	public last_modified_at!: string;
	@Column()
	public creator_id!: string;
	@Column()
	public created_at!: string;
	@Column()
	public updated_at!: string;
	@Column()
	public public!: string;
	@Column()
	public connected_spreadsheet_file_id!: string;
	@Column()
	public connected_spreadsheet_file_link!: string;
	@Column()
	public export_data_when!: string;
	@Column()
	public move_to_topica_folder!: string;
	@Column()
	public move_to_subfolder!: string;
	@Column()
	public sending_method!: string;
	@Column()
	public send_when_reprocess!: string;
	@Column()
	public group_chain_id!: string;
	@Column()
	public entity_id!: number;
	@Column()
	public sub_category_id!: number;
	@ManyToOne(type => SubCategory, user => user.template)
	@JoinColumn({
		name: "sub_category_id",
	})
	public sub_category!: SubCategory;


	@OneToMany(type => Document, document => document.template)
	public document!: Document;
}
