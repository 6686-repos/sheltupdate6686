import { createWriteStream, mkdirSync } from "fs";
import { rm } from "fs/promises";
import { join } from "path";
import { Writable } from "stream";

export const name = "Vencord6686";
export const description = "Injects Vencord6686; This is the only officially supported Vencord6686 install method";

export async function setup(target, log) {
	const releaseUrl = "https://github.com/6686-repos/Vencord/releases/download/devbuild/";

	mkdirSync(join(target, "vencord-desktop"), { recursive: true });

	for (const f of ["vencordDesktopMain.js", "vencordDesktopPreload.js", "renderer.js", "vencordDesktopRenderer.css"]) {
		log(`Downloading ${f}...`);

		const p = join(target, "vencord-desktop", f);
		await rm(p, { force: true });

		const req = await fetch(releaseUrl + f);
		await req.body.pipeTo(Writable.toWeb(createWriteStream(p)));
	}

	log("Done!");
}
