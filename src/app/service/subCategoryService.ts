import {Category} from "@/app/models/Category";
import axios, {AxiosError} from "axios";
import {StringUtil} from "@/app/utils/stringUtil";
import {InsertableSubcategory, Subcategory} from "@/app/models/Subcategory";

export default class SubcategoryService {

    static async getSubcategoriesForCategory(categoryId: number): Promise<Category[]> {
        try {
            const response = await axios.get(`/api/categories/${categoryId}/subcategories`);
            return response.data.data as Subcategory[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async createSubCategoryForCategory(newSubcategory: InsertableSubcategory): Promise<void> {
        try {
            await axios.post(`/api/categories/${newSubcategory.category_id}/subcategories`, newSubcategory);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async deleteSubCategory(subcategory : Subcategory): Promise<void> {
        try {
            await axios.delete(`/api/subcategories/${subcategory.id}`);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}