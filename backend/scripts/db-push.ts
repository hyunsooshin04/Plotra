import { execSync } from "child_process";

// drizzle-kit push가 인터랙티브 확인을 요구하므로
// stdin에 "y\n"를 반복 전달하여 자동 승인한다.
// Windows/macOS/Linux 모두 호환.
execSync("drizzle-kit push", {
  cwd: process.cwd(),
  stdio: ["pipe", "inherit", "inherit"],
  input: "y\n".repeat(20),
});
