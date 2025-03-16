import { createWriteStream, mkdirSync } from "fs";
import { rm } from "fs/promises";
import { join } from "path";
import { Writable } from "stream";

export const name = "Equicord6686";
export const description = "Injects Equicord6686 (Equicord Fork); This is the only officially supported Equicord6686 install method";

export async function setup(target, log) {
	const releaseUrl = "https://github.com/6686-repos/Equicord/releases/download/latest/";
	
	mkdirSync(join(target, "equicord6686-desktop"), { recursive: true });

	for (const f of ["equicordDesktopMain.js", "equicordDesktopPreload.js", "renderer.js", "renderer.css"]) {
		log(`Downloading ${f}...`);

		const p = join(target, "equicord6686-desktop", f);
		await rm(p, { force: true });

		const req = await fetch(releaseUrl + f);
		await req.body.pipeTo(Writable.toWeb(createWriteStream(p)));
	}

	log("Done!");
}
