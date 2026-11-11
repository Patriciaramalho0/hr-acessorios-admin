/** @jest-environment node */
const path = require("node:path");
const { withExistingDirectoryMkdir } = require("./windows-build-filesystem.cjs");

describe("Windows build mkdir compatibility", () => {
  const root = path.resolve(".next");
  const target = path.join(root, "types", "app");
  const denied = Object.assign(new Error("denied"), { code: "EPERM" });
  function invoke(error, statError, directory, destination = target) {
    const fs = { mkdir: jest.fn((_target, cb) => cb(error)), stat: jest.fn((_target, cb) => cb(statError, { isDirectory: () => directory })) };
    const callback = jest.fn();
    withExistingDirectoryMkdir(fs, root).mkdir(destination, callback);
    return { fs, callback };
  }
  test("accepts EPERM only for a verified existing output directory", () => {
    expect(invoke(denied, null, true).callback).toHaveBeenCalledWith(null);
  });
  test("preserves EPERM when the target is missing or a file", () => {
    expect(invoke(denied, new Error("missing"), false).callback).toHaveBeenCalledWith(denied);
    expect(invoke(denied, null, false).callback).toHaveBeenCalledWith(denied);
  });
  test("does not suppress errors outside the build directory", () => {
    const result = invoke(denied, null, true, path.resolve("src"));
    expect(result.callback).toHaveBeenCalledWith(denied);
    expect(result.fs.stat).not.toHaveBeenCalled();
  });
  test("passes through other errors and successful mkdir", () => {
    const error = Object.assign(new Error("read only"), { code: "EROFS" });
    expect(invoke(error).callback).toHaveBeenCalledWith(error);
    expect(invoke(null).callback).toHaveBeenCalledWith(null);
  });
});
