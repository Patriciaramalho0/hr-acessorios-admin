import { createServerActionClient } from "./server-action";
import { createServerClient } from "@supabase/ssr";
jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn() }));
jest.mock("next/headers", () => ({ cookies: () => ({ getAll: () => [], set: jest.fn() }) }));
describe("server action authorization boundary", () => {
 const original = process.env.ADMIN_USER_ID;
 const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 beforeEach(() => { process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co"; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"; });
 afterEach(() => { if(originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl; if(originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey; });
 afterEach(() => { if(original === undefined) delete process.env.ADMIN_USER_ID; else process.env.ADMIN_USER_ID = original; });
 test("does not expose a mutation client to customers", async () => {
 process.env.ADMIN_USER_ID="admin";
 const from=jest.fn();
 (createServerClient as jest.Mock).mockReturnValue({auth:{getUser:jest.fn().mockResolvedValue({data:{user:{id:"customer"}},error:null})},from});
 await expect(createServerActionClient()).rejects.toThrow("não autorizado");
 expect(from).not.toHaveBeenCalled();
 });
 test("returns the session client for the configured administrator", async () => {
 process.env.ADMIN_USER_ID="admin";
 const client={auth:{getUser:jest.fn().mockResolvedValue({data:{user:{id:"admin"}},error:null})}};
 (createServerClient as jest.Mock).mockReturnValue(client);
 await expect(createServerActionClient()).resolves.toBe(client);
 });
});