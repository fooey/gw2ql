
import {
	getLang,
	getLangs,
 } from 'src/lib/api';


export const Lang = `
    type Lang {
		slug: String,
		name: String,
		label: String,
	}
`;

export const resolvers = {
	Lang:  (obj, { slug })  => getLang(slug),
	// Langs: (obj, { slugs }) => getLangs(slugs),
}
