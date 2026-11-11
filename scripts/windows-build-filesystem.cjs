const path = require("node:path");

// Some Windows filesystems return EPERM rather than EEXIST for mkdir races.
// Only accept an already existing directory inside this build's output folder.
function withExistingDirectoryMkdir(fileSystem, outputRoot) {
  const wrapped = Object.create(fileSystem);
  wrapped.mkdir = function (target, ...args) {
    const callback = args[args.length - 1];
    if (typeof callback !== "function") return fileSystem.mkdir(target, ...args);
    const relative = path.relative(path.resolve(outputRoot), path.resolve(String(target)));
    const insideOutput = relative === "" || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative));
    args[args.length - 1] = (error, ...result) => {
      if (!insideOutput || error?.code !== "EPERM") return callback(error, ...result);
      fileSystem.stat(target, (statError, stats) => {
        if (!statError && stats.isDirectory()) return callback(null, ...result);
        callback(error, ...result);
      });
    };
    return fileSystem.mkdir(target, ...args);
  };
  return wrapped;
}

class WindowsBuildFilesystemPlugin {
  apply(compiler) {
    compiler.hooks.afterEnvironment.tap("WindowsBuildFilesystemPlugin", () => {
      compiler.outputFileSystem = withExistingDirectoryMkdir(
        compiler.outputFileSystem,
        path.resolve(compiler.context, ".next")
      );
    });
  }
}
module.exports = { withExistingDirectoryMkdir, WindowsBuildFilesystemPlugin };
