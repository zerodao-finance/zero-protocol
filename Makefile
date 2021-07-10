start_signal_server:
	docker-compose -f ./webrtc/development.yaml up -d
stop_signal_server:
	docker-compose -f ./webrtc/development.yaml down
