
import Promise from 'bluebird';
import _ from 'lodash';

export const langs = {
	en: {
		slug: "en",
		label: "EN",
		name: "English",
	},
	de: {
		slug: "de",
		label: "DE",
		name: "Deutsch",
	},
	es: {
		slug: "es",
		label: "ES",
		name: "Español",
	},
	fr: {
		slug: "fr",
		label: "FR",
		name: "Français",
	},
	zh: {
		slug: "zh",
		label: "中文",
		name: "中文",
	},
};

export function getLang(slug) {
	return Promise.resolve(_.get(langs, slug));
}


export function getLangs(slugs = []) {
	// console.log('getLangs', slugs.toString());

	if (!Array.isArray(slugs) || slugs.length === 0 || slugs.indexOf('all') !== -1) {
		return Promise.resolve(_.values(langs));
	} else {
		return Promise.map(slugs, slug => _.get(langs, slug));
	}
}

export default langs;
