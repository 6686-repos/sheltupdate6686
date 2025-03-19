import { execSync } from "child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { rm } from "fs/promises";
import { platform } from "os";
import { join } from "path";

export const name = "Equicord (Local Build)";
export const description = "Injects locally compiled Equicord (Vencord Fork); This is not an officially supported Equicord install method";

export async function setup(target, log) {
    const appDataPath = platform() === "win32" 
        ? process.env.APPDATA
        : platform() === "darwin"
            ? join(process.env.HOME, "Library", "Application Support")
            : join(process.env.HOME, ".local", "share");
            
    const repoDir = join(appDataPath, "dsmodinstaller", "equicord");
    const buildDir = join(target, "build");
    const desktopDir = join(target, "equicord-desktop");
    
    // Ensure directories exist
    mkdirSync(repoDir, { recursive: true });
    mkdirSync(buildDir, { recursive: true });
    mkdirSync(desktopDir, { recursive: true });
    
    // Clone or update Equicord
    log("Cloning/updating Equicord...");
    if (!existsSync(join(repoDir, ".git"))) {
        execSync("git clone https://github.com/Equicord/Equicord.git .", {
            cwd: repoDir,
            stdio: "inherit"
        });
    } else {
        execSync("git pull", {
            cwd: repoDir,
            stdio: "inherit"
        });
    }
    
    // Copy repo to build directory for building
    execSync(`xcopy "${repoDir}" "${buildDir}" /E /I /H /Y /Q`, {
        stdio: "ignore"
    });
    
    try {
        log("Installing dependencies...");
        execSync("npm install", {
            cwd: buildDir,
            stdio: "inherit"
        });
        
        log("Building Equicord...");
        execSync("pnpm build", {
            cwd: buildDir,
            stdio: "inherit"
        });

    } catch (error) {
        log("Build failed!");
        log("Error details:");
        log(error.toString());
        throw error;
    }
    
    // Copy built files to desktop directory
    const files = {
        "dist/desktop/patcher.js": "equicordDesktopMain.js",
        "dist/desktop/preload.js": "equicordDesktopPreload.js",
        "dist/desktop/renderer.js": "renderer.js",
        "dist/desktop/renderer.css": "renderer.css"
    };

    for (const [src, dest] of Object.entries(files)) {
        log(`Copying ${dest}...`);
        
        const p = join(desktopDir, dest);
        await rm(p, { force: true });
        
        const sourcePath = join(buildDir, src);
        const writeStream = createWriteStream(p);
        const readStream = createReadStream(sourcePath);
        await new Promise((resolve, reject) => {
            readStream.pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });
    }

    // Cleanup build directory
    await rm(buildDir, { recursive: true, force: true });
    
    log("Done!");
}