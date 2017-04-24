
import _ from 'lodash';


export function slugify(str) {
	return _.words(_.deburr(str).toLowerCase()).join('-');
}
