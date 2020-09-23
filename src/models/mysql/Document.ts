import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Template} from "./Template";

/* tslint:disable */
@Entity("documents")
export class Document {

	@PrimaryGeneratedColumn()
	public id!: number;
	@Column()
	public name!: string;
	@Column()
	public file_id!: string;
	@Column()
	public icon!: string;
	@Column()
	public doc_link!: string;
	@Column()
	public mime_type!: string;
	@Column()
	public process_document_id!: number;
	@Column()
	public created_at!: Date;
	@Column()
	public updated_at!: Date;
	@Column()
	public last_modifier_id!: number;
	@Column()
	public creator_id!: number;
	@Column()
	public embed_link!: string;
	@Column()
	public thumb_link!: string;
	@Column()
	public template_id!: number;
	@Column()
	public template_main_file!: number;


	@ManyToOne(type => Template, template => template.document)
	@JoinColumn({
		name: "template_id",
	})
	public template!: Template;
}
