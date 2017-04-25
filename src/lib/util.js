
import _ from 'lodash';


export function slugify(str) {
	return _.kebabCase(str);
}
