import { editProfile } from './editProfile';
import { createServerActionClient } from '@/lib/supabase/server-action';
jest.mock('@/lib/supabase/server-action', () => ({ createServerActionClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
describe('profile without legacy staff tables', () => {
 test('does not allow editing another account', async () => {
  const updateUser = jest.fn();
  (createServerActionClient as jest.Mock).mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null }), updateUser } });
  await expect(editProfile('customer', new FormData())).resolves.toEqual({ dbError: 'Perfil não autorizado.' });
  expect(updateUser).not.toHaveBeenCalled();
 });
 test('updates the authenticated profile without table access or deleting images', async () => {
  const updateUser = jest.fn().mockResolvedValue({ error: null });
  const from = jest.fn();
  (createServerActionClient as jest.Mock).mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: 'admin', user_metadata: { existing: 'preserved' } } }, error: null }), updateUser }, from });
  const form = new FormData();
  form.set('name', 'Helen'); form.set('phone', '5562999999999'); form.set('image', 'https://example.com/avatar.png');
  await expect(editProfile('admin', form)).resolves.toEqual({ success: true });
  expect(updateUser).toHaveBeenCalledWith({ data: { existing: 'preserved', name: 'Helen', phone: '5562999999999' } });
  expect(from).not.toHaveBeenCalled();
 });
});