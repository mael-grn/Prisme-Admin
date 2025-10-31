import {Subcategory} from "@/app/models/Subcategory";

export default class CategoryUtil {
    static getSubcategoryInFirstButNotInSecond(first: Subcategory[], second: Subcategory[]): Subcategory[] {
        return first.filter(sub1 => !second.some(sub2 => sub2.id === sub1.id));
    }
}