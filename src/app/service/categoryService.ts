import {Category, InsertableCategory, RecursiveCategory} from "@/app/models/Category";
import axios, {AxiosError} from "axios";
import {Page} from "@/app/models/Page";
import {StringUtil} from "@/app/utils/stringUtil";
import {Subcategory} from "@/app/models/Subcategory";

export default class CategoryService {

    static async getAllCategories(): Promise<Category[]> {
        try {
            const response = await axios.get(`/api/categories`);
            return response.data.data as Category[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async createCategory(newCat : InsertableCategory): Promise<void> {
        try {
            await axios.post(`/api/categories`, newCat);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async updateCategory(updatedCat : Category): Promise<void> {
        try {
            await axios.put(`/api/categories/${updatedCat.id}`, updatedCat);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async deleteCategory(category : Category): Promise<void> {
        try {
            await axios.delete(`/api/categories/${category.id}`);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getAllRecursiveCategories() : Promise<RecursiveCategory[]> {
        try {
            const response = await axios.get(`/api/categories?recursive=true`);
            return response.data.data as RecursiveCategory[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }


}