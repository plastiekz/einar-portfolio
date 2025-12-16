import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Skill } from '../types';

interface SkillDB extends DBSchema {
    skills: {
        key: string;
        value: Skill;
    };
}

const DB_NAME = 'synapse_tier3_skills';
const STORE_NAME = 'skills';

class SkillService {
    private dbPromise: Promise<IDBPDatabase<SkillDB>>;

    constructor() {
        this.dbPromise = openDB<SkillDB>(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            },
        });
    }

    async registerSkill(skill: Skill): Promise<void> {
        try {
            const db = await this.dbPromise;
            await db.put(STORE_NAME, skill);
            console.log(`[Motor Cortex] New skill learned: ${skill.name}`);
        } catch (error) {
            console.error(`[Motor Cortex] Failed to learn skill ${skill.name}:`, error);
        }
    }

    async getAllSkills(): Promise<Skill[]> {
        try {
            const db = await this.dbPromise;
            return await db.getAll(STORE_NAME);
        } catch (error) {
            console.error("[Motor Cortex] Failed to recall skills:", error);
            return [];
        }
    }

    async deleteSkill(id: string): Promise<void> {
        try {
            const db = await this.dbPromise;
            await db.delete(STORE_NAME, id);
        } catch (error) {
            console.error(`[Motor Cortex] Failed to forget skill ${id}:`, error);
        }
    }
}

export const skillService = new SkillService();
