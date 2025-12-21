import { MarketItem } from '../../types';

export interface Scraper {
    name: string;
    /**
     * Scrapes the platform for the given query.
     * @param query Search term (e.g. "developer", "iphone")
     * @param location Optional location filter
     */
    scrape(query: string, location?: string): Promise<MarketItem[]>;
}
