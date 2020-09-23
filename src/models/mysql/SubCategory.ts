import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Template} from "./Template";

/* tslint:disable */
@Entity("sub_categories")
export class SubCategory {
	@PrimaryGeneratedColumn()
	public id!: number;

	@Column()
	public category_id!: number;

	@Column()
	public name!: string;

	@Column()
	public is_visible!: number;

	@Column()
	public created_at!: Date;

	@Column()
	public updated_at!: Date;

	@OneToMany(type => Template, template => template.sub_category)
	public template!: Template[];
}
