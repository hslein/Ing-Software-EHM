// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import App from './App.vue';

vi.mock('vue-router', () => ({
  RouterView: { name: 'RouterView', template: '<main data-test="router-view" />' },
  useRoute: () => ({ meta: {} }),
  useRouter: () => ({ push: vi.fn() }),
}));

describe('App', () => {
  it('renders properly', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          NavBar: true,
          DealerFooter: true,
          ChatbotButton: true,
        },
      },
    });

    expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true);
  });
});
