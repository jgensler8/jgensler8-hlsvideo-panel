import { test, expect } from '@grafana/plugin-e2e';

test('should set visualization and video element should be visible', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
  page,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await panelEditPage.setVisualization('HLS Video');
  await panelEditPage.collapseSection('HLS Video');
  await expect(page.getByTestId('hlsvideo')).toBeVisible();
});
