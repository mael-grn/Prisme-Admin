export interface WebsiteColors {
    id: number;
    website_id: number;
    primary_color: string;
    primary_variant: string;
    secondary_color: string;
    secondary_variant: string;
    background_color: string;
    background_variant: string;
    background_variant_variant: string;
    text_color: string;
    text_variant: string;
    text_variant_variant: string;
}

export interface InsertableWebsiteColors {
    website_id: number;
    primary_color: string;
    primary_variant: string;
    secondary_color: string;
    secondary_variant: string;
    background_color: string;
    background_variant: string;
    background_variant_variant: string;
    text_color: string;
    text_variant: string;
    text_variant_variant: string;
}

export const getDefaultColors = (websiteId: number) : InsertableWebsiteColors => {
    return {
        website_id: websiteId,
        primary_color: "#5ca6b3",
        primary_variant: "#2F7C8A",
        secondary_color: "#c53854",
        secondary_variant: "#A91D3A",
        background_color: "#000000",
        background_variant: "#121212",
        background_variant_variant: "#2c2c2c",
        text_color: "#ffffff",
        text_variant: "#cfcfcf",
        text_variant_variant: "#bfbfbf"
    }
}

