'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useLanguage } from '../context/language-context';
import { driver, type DriveStep, type Side } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useTour(isAdmin: boolean) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const runTour = useCallback(
    async (force = false) => {
      const tourKey = `has_completed_tour_${pathname.replace(/\//g, '_')}`;
      const hasSeenTour = localStorage.getItem(tourKey);

      if (hasSeenTour && !force) return;
      const waitForElement = async (selector: string, timeout = 10000) => {
        return new Promise((resolve) => {
          const startTime = Date.now();
          const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
              clearInterval(interval);
              resolve(true);
            } else if (Date.now() - startTime > timeout) {
              clearInterval(interval);
              console.warn(`Tour Timeout: Element ${selector} not found`);
              resolve(false);
            }
          }, 100);
        });
      };
      let steps: DriveStep[] = [];
      const step = (s: DriveStep): DriveStep => s;
      // Dashboard
      if (pathname === '/dashboard') {
        steps = [
          step({
            element: '#tour-welcome',
            popover: {
              title: t('dashboard.tutorial.title'),
              description: t('dashboard.tutorial.welcome'),
              side: 'bottom',
              align: 'start',
            },
          }),
          step({
            element: '#tour-stats',
            popover: {
              title: t('dashboard.statistics'),
              description: t('dashboard.tutorial.stats'),
              side: 'top',
              align: 'center',
            },
          }),
          ...(isAdmin
            ? [
                step({
                  element: '#tour-admin-chart',
                  popover: {
                    title: t('dashboard.tutorial.title'),
                    description: t('dashboard.tutorial.adminChart'),
                    side: 'right',
                    align: 'start',
                  },
                }),
              ]
            : []),
        ];
      }

      // Permohonan
      else if (pathname === '/dashboard/permohonan') {
        steps = [
          {
            element: '#tour-permohonan-stepper',
            popover: {
              title: t('pages.permohonan.title'),
              description: t('pages.permohonan.tour.stepper'),
              side: 'bottom',
            },
          },
          {
            element: '#tour-permohonan-form',
            popover: {
              title: t('pages.permohonan.tour.form'),
              description: t('pages.permohonan.tour.form'),
              side: 'top',
            },
          },
          {
            element: '#tour-permohonan-upload',
            popover: {
              title: t('evacuation.uploadFile'),
              description: t('pages.permohonan.tour.upload'),
              side: 'top',
            },
          },
          {
            element: '#tour-permohonan-nav',
            popover: {
              title: `${t('common.next')} / ${t('common.submit')}`,
              description: t('pages.permohonan.tour.nav'),
              side: 'top',
            },
          },
        ];
      }

      // Verifikasi
      else if (pathname === '/dashboard/verifikasi') {
        steps = [
          {
            element: '#tour-verif-stats',
            popover: {
              title: t('pages.verifikasi.summary'),
              description: t('pages.verifikasi.tour.stats'),
              side: 'bottom',
            },
          },
          {
            element: '#tour-verif-table',
            popover: {
              title: t('pages.verifikasi.title'),
              description: t('pages.verifikasi.tour.table'),
              side: 'top',
            },
          },
          {
            element: '#tour-verif-action',
            popover: {
              title: t('dashboard.viewDetails'),
              description: t('pages.verifikasi.tour.detail'),
              side: 'left',
            },
          },
          ...(isAdmin
            ? [
                {
                  element: '#tour-verif-actions',
                  popover: {
                    title: t('pages.verifikasi.tour.actions'),
                    description: t('pages.verifikasi.tour.actions'),
                    side: 'top' as Side,
                  },
                },
              ]
            : []),
        ];
      }

      // Revisi
      else if (pathname === '/dashboard/revisi') {
        steps = [
          {
            element: '#tour-revis-list',
            popover: {
              title: t('pages.revisi.title'),
              description: t('pages.revisi.tour.list'),
              side: 'bottom' as Side,
            },
          },
          {
            element: '#tour-revis-note',
            popover: {
              title: t('pages.revisi.tour.note'),
              description: t('pages.revisi.tour.note'),
              side: 'top' as Side,
            },
          },
          {
            element: '#tour-revis-edit',
            popover: {
              title: t('common.edit'),
              description: t('pages.revisi.tour.edit'),
              side: 'left' as Side,
            },
          },
        ];
      }

      // Selesai
      else if (pathname === '/dashboard/selesai') {
        steps = [
          {
            element: '#tour-sele-archive',
            popover: {
              title: t('pages.selesai.title'),
              description: t('pages.selesai.tour.archive'),
              side: 'bottom',
            },
          },
          {
            element: '#tour-sele-preview',
            popover: {
              title: t('pages.selesai.tour.preview'),
              description: t('pages.selesai.tour.preview'),
              side: 'left',
            },
          },
          {
            element: '#tour-sele-download',
            popover: {
              title: t('pages.selesai.tour.download'),
              description: t('pages.selesai.tour.download'),
              side: 'left',
            },
          },
        ];
      }

      // Penerbitan
      else if (pathname === '/dashboard/penerbitan') {
        steps = [
          {
            element: '#tour-pene-list',
            popover: {
              title: t('pages.penerbitan.title'),
              description: t('pages.penerbitan.tour.queue'),
              side: 'bottom',
            },
          },
          ...(isAdmin
            ? [
                {
                  element: '#tour-pene-upload',
                  popover: {
                    title: t('pages.penerbitan.tour.upload'),
                    description: t('pages.penerbitan.tour.upload'),
                    side: 'top' as Side,
                  },
                },
                {
                  element: '#tour-pene-submit',
                  popover: {
                    title: t('pages.penerbitan.tour.submit'),
                    description: t('pages.penerbitan.tour.submit'),
                    side: 'top' as Side,
                  },
                },
              ]
            : []),
        ];
      }

      // Sidebar help (always)
      steps.push({
        element: '#tour-sidebar-help',
        popover: {
          title: t('dashboard.tutorial.title'),
          description: t('dashboard.tutorial.sidebar'),
          side: 'right' as Side,
          align: 'center',
        },
      });

      if (steps.length <= 1) return;

      const driverObj = driver({
        showProgress: true,
        nextBtnText: t('dashboard.tutorial.next'),
        prevBtnText: t('dashboard.tutorial.prev'),
        doneBtnText: t('dashboard.tutorial.done'),

        smoothScroll: true,
        allowClose: true,
        overlayClickBehavior: 'close',
        steps,
        onDestroyed: () => {
          localStorage.setItem(tourKey, 'true');
        },
      });
      const firstElementFound = await waitForElement(steps[0].element as string);
      if (!firstElementFound) return;
      
      driverObj.drive();
    },
    [isAdmin, t, pathname],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      runTour();
    }, 1200);

    const handleStartTour = () => runTour(true);
    window.addEventListener('start-tour', handleStartTour);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('start-tour', handleStartTour);
    };
  }, [runTour, pathname]);

  return { runTour };
}
