import { initOneSignal } from '@/services/base/api';
import { AppModules } from '@/services/base/constant';
import { currentRole, oneSignalClient, oneSignalRole } from '@/utils/ip';
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import OneSignal from 'react-onesignal';

const OneSignalBounder = (props: { children: React.ReactNode }) => {
	const [oneSignalId, setOneSignalId] = useState<string | null | undefined>();
	const auth = useAuth();
	const iframeSource = AppModules[oneSignalRole].url;
	// let iframe: HTMLIFrameElement | null = null;

	const getUserIdOnesignal = async () => {
		if (!!oneSignalClient) {
			await OneSignal.init({
				appId: oneSignalClient,
			});
			const id = await OneSignal.getUserId();
			setOneSignalId(id);
		}
	};

	useEffect(() => {
		// Nếu đây là trang handle OneSignal
		if (oneSignalRole.valueOf() === currentRole.valueOf()) getUserIdOnesignal();
		else if (iframeSource) {
			// window.addEventListener('message', receiveMessage, false);
			// showPopup(`${iframeSource}notification/subscribe`, 1, 1);
			// iframe = document.createElement('iframe');
			// iframe.setAttribute('src', `${iframeSource}notification/check?source=${window.location.origin}`);
			// iframe.style.display = 'none';
			// document.body.appendChild(iframe);
		}
	}, []);

	/**
	 * Init OneSignal playerId with auth User
	 */
	useEffect(() => {
		if (oneSignalId) {
			if (auth.user?.access_token) {
				try {
					initOneSignal({ playerId: oneSignalId });
				} catch (er) {
					console.log(er);
				}
			}
		}
	}, [oneSignalId, auth.user?.access_token]);

	return <>{props.children}</>;
};

export default OneSignalBounder;
