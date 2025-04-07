import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Text } from '@/components/text'

interface UpdateEntry {
  version: string
  date: string
  title: string
  description: string
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'security'
    content: string
  }[]
}

// 更新日志数据
const updateHistory: UpdateEntry[] = [
  {
    version: '1.0.0',
    date: '2024-04-07',
    title: '测试版本上线',
    description: '这次更新强化了客户管理功能，新增了批量导入导出和高级筛选功能。',
    changes: [
      { type: 'feature', content: '新增客户批量导入功能，支持Excel格式' },
      { type: 'feature', content: '新增客户数据批量导出功能' },
      { type: 'improvement', content: '改进了客户列表的加载速度，提升了50%' },
      { type: 'improvement', content: '优化了客户标签系统，增加了多标签筛选' },
      { type: 'fix', content: '修复了某些情况下客户地址无法保存的问题' },
      { type: 'feature', content: '基础客户管理功能' },
      { type: 'feature', content: '订单跟踪系统' },
      { type: 'feature', content: '用户权限管理' },
      { type: 'feature', content: '基础报表功能' },
      { type: 'feature', content: '通知提醒系统' },
    ],
  },
]

export default async function UpdateLog() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>更新日志</Heading>
      <Text className="mt-2 text-gray-500">查看系统的所有更新历史和功能变更</Text>

      <div className="mt-10 space-y-12">
        {updateHistory.map((update, index) => (
          <div key={update.version} className="relative">
            <div className="flex gap-4">
              {/* 版本标记 */}
              <div className="relative flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-700/30">
                <span className="text-sm font-semibold text-blue-700">v{update.version.split('.')[0]}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Subheading>版本 {update.version}</Subheading>
                  <Badge color="blue" className="font-normal">
                    {update.date}
                  </Badge>
                </div>

                <Text className="mt-1 font-medium text-gray-900">{update.title}</Text>
                <Text className="mt-1 text-gray-600">{update.description}</Text>

                <div className="mt-4 space-y-3">
                  {update.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start gap-2">
                      <Badge
                        color={
                          change.type === 'feature'
                            ? 'lime'
                            : change.type === 'improvement'
                              ? 'blue'
                              : change.type === 'fix'
                                ? 'amber'
                                : 'rose'
                        }
                        className="mt-0.5 flex-none px-2 py-0.5 font-medium capitalize"
                      >
                        {change.type}
                      </Badge>
                      <Text className="text-gray-800">{change.content}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {index < updateHistory.length - 1 && <Divider className="mt-8" />}
          </div>
        ))}
      </div>
    </div>
  )
}
