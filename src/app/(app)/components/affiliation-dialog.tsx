'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Listbox, ListboxLabel, ListboxOption } from '@/components/listbox'
import { getCustomerAffiliations, updateCustomerAffiliation } from '@/lib/actions'
import { useEffect, useState } from 'react'

// Matches the schema in prisma/schema.prisma
interface CustomerAffiliation {
  id: number
  name: string
  avatar: string | null
  link: string | null
  submitUser: string | null
}

export function AffiliationDialog({
  phoneNumber,
  customerId,
  initialAffiliation,
}: {
  phoneNumber: string
  customerId: number
  initialAffiliation: string | null
}) {
  let [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [affiliations, setAffiliations] = useState<CustomerAffiliation[]>([])
  const [selectedAffiliation, setSelectedAffiliation] = useState(initialAffiliation || '')

  // 获取客户归属数据
  const fetchAffiliations = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCustomerAffiliations()
      setAffiliations(data)
    } catch (err) {
      setError('获取客户归属失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 当对话框打开时获取数据
  useEffect(() => {
    if (isOpen) {
      fetchAffiliations()
    }
  }, [isOpen])

  // 处理对话框打开
  const handleDialogOpen = () => {
    if (!loading) {
      setIsOpen(true)
    }
  }

  // 处理归属更新
  const handleAffiliationChange = async (value: string) => {
    if (value === selectedAffiliation) return

    setIsUpdating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customerId.toString())
      formData.append('affiliation', value)

      await updateCustomerAffiliation(formData)
      setSelectedAffiliation(value)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新归属失败')
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  // 获取当前选中的归属信息
  const currentAffiliation = affiliations.find((a) => a.name === selectedAffiliation) || null

  return (
    <>
      <span
        className={`cursor-pointer text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white ${loading ? 'pointer-events-none opacity-50' : ''}`}
        onClick={handleDialogOpen}
      >
        {loading ? '加载中...' : selectedAffiliation || '无归属'}
      </span>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>{phoneNumber} 的归属信息</DialogTitle>
        <DialogDescription>您可以查看和更新客户的归属信息</DialogDescription>
        <DialogBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : affiliations.length === 0 ? (
            <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
              <p>您尚未创建任何客户归属，请点击添加归属按钮来创建新的归属</p>
            </div>
          ) : (
            <>
              <Field className="mb-6">
                <Label>更新归属</Label>
                <Listbox value={selectedAffiliation} onChange={handleAffiliationChange} disabled={isUpdating}>
                  <ListboxOption value="">
                    <ListboxLabel>无归属</ListboxLabel>
                  </ListboxOption>
                  {affiliations.map((affiliation) => (
                    <ListboxOption key={affiliation.id} value={affiliation.name}>
                      <ListboxLabel>{affiliation.name}</ListboxLabel>
                    </ListboxOption>
                  ))}
                </Listbox>
                {isUpdating && (
                  <div className="mt-2 flex items-center">
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span className="text-sm text-zinc-500">更新中...</span>
                  </div>
                )}
              </Field>

              {currentAffiliation ? (
                <DescriptionList>
                  <DescriptionTerm>归属名称</DescriptionTerm>
                  <DescriptionDetails>{currentAffiliation.name}</DescriptionDetails>

                  {currentAffiliation.avatar && (
                    <>
                      <DescriptionTerm>头像</DescriptionTerm>
                      <DescriptionDetails>
                        <Avatar className="size-10" src={currentAffiliation.avatar} alt={currentAffiliation.name} />
                      </DescriptionDetails>
                    </>
                  )}

                  {currentAffiliation.link && (
                    <>
                      <DescriptionTerm>相关链接</DescriptionTerm>
                      <DescriptionDetails>
                        <a
                          href={currentAffiliation.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {currentAffiliation.link}
                        </a>
                      </DescriptionDetails>
                    </>
                  )}

                  {currentAffiliation.submitUser && (
                    <>
                      <DescriptionTerm>创建用户</DescriptionTerm>
                      <DescriptionDetails>{currentAffiliation.submitUser}</DescriptionDetails>
                    </>
                  )}
                </DescriptionList>
              ) : (
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-300">当前客户没有选择归属</p>
                </div>
              )}
            </>
          )}
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
