import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import type { ColumnType } from 'antd/lib/table';
import type { FilterConfirmProps } from 'antd/lib/table/interface';
import type { InputRef } from 'antd';
import { useMemo, useRef } from 'react';

const normalize = (v: unknown) => (v ?? '').toString().toLowerCase();

export const useTableSearch = <T extends object>() => {
	const inputRef = useRef<InputRef>(null);

	const getStringColumnSearchProps = useMemo(
		() =>
			(dataIndex: keyof T, placeholder: string): ColumnType<T> => ({
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
						<Input
							ref={inputRef}
							placeholder={placeholder}
							value={selectedKeys[0] as any}
							onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => confirm()}
							allowClear
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button type='primary' onClick={() => confirm()} size='small' icon={<SearchOutlined />}>
								Tìm
							</Button>
							<Button
								onClick={() => {
									clearFilters?.();
									confirm({ closeDropdown: true } as FilterConfirmProps);
								}}
								size='small'
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? undefined : undefined }} />,
				onFilter: (value, record) => {
					const recordValue = (record as any)?.[dataIndex];
					return normalize(recordValue).includes(normalize(value));
				},
				onFilterDropdownVisibleChange: (visible) => {
					if (visible) setTimeout(() => inputRef.current?.select(), 100);
				},
			}),
		[],
	);

	return { getStringColumnSearchProps };
};
