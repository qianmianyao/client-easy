import { Strong, Text, TextLink } from '@/components/text'

export default async function Help() {
  return (
    <Text>
      This feature is only available to users on the <Strong>Business Plan</Strong>. To upgrade, visit your{' '}
      <TextLink href="#">billing settings</TextLink>.
    </Text>
  )
}
