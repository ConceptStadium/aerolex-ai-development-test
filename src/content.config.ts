import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

const data = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/data' }),
	schema: z.object({
		name: z.string(),
		tagline: z.string(),
	}),
});

const settings = defineCollection({
	loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/settings' }),
	schema: z.object({
		items: z.array(
			z.object({
				label: z.string(),
				href: z.string(),
			}),
		),
	}),
});

export const collections = { pages, data, settings };
