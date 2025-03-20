const fs = require("fs");
const path = require("path");

function verAdd() {
  const packageJsonPath = path.resolve(__dirname, "../package.json");
  const packageJson = require(packageJsonPath);

  // 版本号（0:主版本, 1:次版本, 2:补丁版本）
  const verIndex = 2;
  const version = packageJson.version;
  const versionParts = version.split(".");
  const minorVersion = parseInt(versionParts[verIndex]);
  versionParts[verIndex] = (minorVersion + 1).toString();
  const newVersion = versionParts.join(".");

  packageJson.version = newVersion;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );

  console.log(`Version updated from ${version} to ${newVersion}`);
}

verAdd();
