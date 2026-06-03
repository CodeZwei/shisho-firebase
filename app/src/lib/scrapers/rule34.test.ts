import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { parse } from './rule34.js';

// Fixture captured from: https://rule34.xxx
// To refresh, run from the repo root:
//
//   curl -A "Mozilla/5.0" -o app/src/lib/scrapers/fixtures/rule34.html \
//     "https://rule34.xxx/index.php?page=post&s=view&id=1915346"

const html = readFileSync(
	fileURLToPath(new URL('./fixtures/rule34.html', import.meta.url)),
	'utf-8'
);

describe('rule34 parser', () => {
	it('extracts all metadata from a known post', () => {
		const result = parse(html);

		expect.soft(result.title).toBe("Rule 34 - 2girls areola areolae arms behind back arms tied behind back bangs bayonetta bayonetta (character) beauty mark before sex big breasts black hair blonde hair blush blushing bondage bound bound arms breasts cherry-gig closed eyes completely nude completely nude female crossover dominant dominant female drool drooling earrings erect nipples eyeliner eyeshadow eyewear female female only femdom femsub gag gagged glasses gloves hair bondage hair gag hair grab hair pull human human only large areolae large breasts lesbian lezdom lezsub long hair metroid multiple females multiple girls nintendo nipples nude nude female painted nails perky breasts ponytail prehensile hair restrained saliva saliva trail samus aran submissive submissive female sweat thick lips tied hair tied up very long hair witch yuri | 1915346");
		expect.soft(result.imageUrl).toBe("https://wimg.rule34.xxx//images/1769/f8769b4d0ec93ee5c38207b1693afccc.jpeg?1915346");
		expect.soft(result.tags_copyright).toEqual(["bayonetta", "metroid", "nintendo"]);
		expect.soft(result.tags_character).toEqual(["bayonetta (character)", "samus aran"]);
		expect.soft(result.tags_artist).toEqual(["cherry-gig"]);
		expect.soft(result.tags_general).toEqual(["2girls","areola","areolae","arms behind back","arms tied behind back","bangs","beauty mark","before sex","big breasts","black hair","blonde hair","blush","blushing","bondage","bound","bound arms","breasts","closed eyes","completely nude","completely nude female","dominant","dominant female","drool","drooling","earrings","erect nipples","eyeliner","eyeshadow","eyewear","female","female only","femdom","femsub","gag","gagged","glasses","gloves","hair bondage","hair gag","hair grab","hair pull","human","human only","large areolae","large breasts","lesbian","lezdom","lezsub","long hair","multiple females","multiple girls","nipples","nude","nude female","painted nails","perky breasts","ponytail","prehensile hair","restrained","saliva","saliva trail","submissive","submissive female","sweat","thick lips","tied hair","tied up","very long hair","witch","yuri"]);
		expect.soft(result.tags_meta).toEqual(["crossover"]);
	});
});
