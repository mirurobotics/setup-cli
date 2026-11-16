import * as crypto from 'crypto'
import * as fs from 'fs'

type LinuxAsset = 'cli_Linux_x86_64.tar.gz' | 'cli_Linux_arm64.tar.gz'

/**
 * SHA-256 of each Linux release tarball of the Miru CLI, by version and then by
 * asset name. The action refuses any version missing here, and "latest" and
 * partial versions resolve to the newest stable entry, so add each new CLI
 * release, taking the SHA-256 for each of these assets from its checksums file.
 */
export const CHECKSUMS: Record<string, Record<LinuxAsset, string>> = {
  'v0.12.5': {
    'cli_Linux_x86_64.tar.gz':
      'bab721efc4e8bcbacb1baa0906db1f44e9972c8cda36d9bc68a4eb442111b508',
    'cli_Linux_arm64.tar.gz':
      '407189db2984bed2d0b92948db5a855e0c1844bca98f7a496c9715824325ad5e'
  },
  'v0.12.5-beta.5': {
    'cli_Linux_x86_64.tar.gz':
      '4ab8e0fdb8f04e345b5b5d9349f3d7609190d274c6d9df848889ea4e491df581',
    'cli_Linux_arm64.tar.gz':
      'd917721a9718ac4840faa9d1a17b3aff8dc6658b2b613ef1dee70212170ba336'
  },
  'v0.12.5-beta.3': {
    'cli_Linux_x86_64.tar.gz':
      '573479f86a1dfd71ccea5a6f7bf6480101fe80344715d9904950c998eacd2c98',
    'cli_Linux_arm64.tar.gz':
      '80f6fc5f8bde7021f4582cecaf6abbd083bdc0d8e2941a289becfc0e5c526d2b'
  },
  'v0.12.5-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      '227eb5c4085b7000953b4dea905d35a98fc8cf3dce7b149953ae713f066c1c15',
    'cli_Linux_arm64.tar.gz':
      '7322a74b835a71fa41bf578484382b0d4d220a463f6e0f0b27854dad49c02b98'
  },
  'v0.12.5-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '2dd77708bc46b104269d762c00a4834b46d60fa7f2fffb86b526bddfe928ea93',
    'cli_Linux_arm64.tar.gz':
      '0a2b43157748e15393bbe2ac8a4dfeaf34179257aec156ff47223c8739cffe25'
  },
  'v0.12.4': {
    'cli_Linux_x86_64.tar.gz':
      '13b83dbbe467c01f3fb08a44404a28f9cd61f97d6dafd0bd9eec2612fc631488',
    'cli_Linux_arm64.tar.gz':
      'a7d36f71499ee7d7a6884244937f229a0db9d01197ef5e7f7c01b4747fe38fd0'
  },
  'v0.12.3': {
    'cli_Linux_x86_64.tar.gz':
      '9439996b3de427dc8cd9a51ce97ec9484a0b43f095fdd22d0c1ec269ff1e6c37',
    'cli_Linux_arm64.tar.gz':
      'c2ee842e6fff9090eb1ca895df85ce38cdee74a8bea1d2060000315ce13144b2'
  },
  'v0.12.3-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '043f94307ee463d54d999e735c47d7177ec1242f36799b4d56103fe9b876ab64',
    'cli_Linux_arm64.tar.gz':
      '7590e8b86024b7ffbd99212cf3508cd4d5078ee12b61c22e7e56034bc166d01f'
  },
  'v0.12.2': {
    'cli_Linux_x86_64.tar.gz':
      '1f7c18e60a61bd3c7fab85f64f069d6d6abf40f4d255e9e55ee11afd7737ab11',
    'cli_Linux_arm64.tar.gz':
      'c61bf330f2eb8cad52f314b6d32e174758afa055889a749ece963afe428df0c9'
  },
  'v0.12.2-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '54913c7995619c97b85639a58af80c3809013a20a5d2fa9e0fb281216f99d2b2',
    'cli_Linux_arm64.tar.gz':
      'ebd2f828d04d8c166d857d12259d86090112151cd22274a2e848b5f114cb3aa4'
  },
  'v0.12.1': {
    'cli_Linux_x86_64.tar.gz':
      '0ebdeb9798961a437bd53d6d178dfbd080af71e4cfb09c35f07fcd9302c359f0',
    'cli_Linux_arm64.tar.gz':
      '84da5c3e49b765d00d541bb07842686edd4e17ae072b7758f047147276399809'
  },
  'v0.12.1-beta.4': {
    'cli_Linux_x86_64.tar.gz':
      '302d126bb7cfa3768d9ccf2f271ec61cddb5a68fb626a8f4ae71fd596d25d6ae',
    'cli_Linux_arm64.tar.gz':
      '5ff079f04873faf783d472a4dd50619d6fadd1298a461e87066bd1aa313684e9'
  },
  'v0.12.1-beta.3': {
    'cli_Linux_x86_64.tar.gz':
      'd447276dc09a7f7df8c3dca312e5eea340184cc22c40b00c252f551b4de425d9',
    'cli_Linux_arm64.tar.gz':
      '8a70bc3cb6f648992b53baf7edb678e41a5152070092b35d92277c848ef0ccf4'
  },
  'v0.12.1-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      'a2d11b1cc73d67cd2297fa28047e4702a8d8722aa480ac8895c01afa634f01ba',
    'cli_Linux_arm64.tar.gz':
      '4411d0bfe0d082d2fd3519c32a1fc096f0a57061b6f05c79cc34ce83985bf657'
  },
  'v0.12.1-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '11eb63faa1f9c95aca11669342282f7e5cb7005ca488cfebf5986a5ec2bdd769',
    'cli_Linux_arm64.tar.gz':
      'aa20ddbf3f7d8147e906e6ff3ba32de34972a32854ca983fc7d9568d4b922edc'
  },
  'v0.12.0': {
    'cli_Linux_x86_64.tar.gz':
      'd93e40e3113a2e4cb8b723e72e145a5708f58922860d1150ec4c571b2c161e6d',
    'cli_Linux_arm64.tar.gz':
      '6b04b46bff77fa5edaf058d83cd91061bfb9fed94ed4f89e892f661b0ce070b6'
  },
  'v0.11.1': {
    'cli_Linux_x86_64.tar.gz':
      'd0cd017f7f5b63950f0d68f5ca4ce30a822cc2cc2ea3e1feb97fe8b4e6138f67',
    'cli_Linux_arm64.tar.gz':
      'c7b5cf2ecf7fd808b133562bac38e29ceac7f7dbea4c7ac148b78e431dbc9c51'
  },
  'v0.11.1-beta.9': {
    'cli_Linux_x86_64.tar.gz':
      '7b4247ae216bda3a8c1a3c186dca968a13add7095b497816c5ff41118bcdb4b7',
    'cli_Linux_arm64.tar.gz':
      'c5c21986e487d20376752130745a2c83b5e301838518051a319b0da0e97f7cd6'
  },
  'v0.11.1-beta.8': {
    'cli_Linux_x86_64.tar.gz':
      '74ed63f31ef8585b3c2ae7b4c4b7dca5860acdf6291c4892cc6cb8120c000cd8',
    'cli_Linux_arm64.tar.gz':
      'f755112aab39be6465fa6a9f3906a103bb8cea37ea56f0121b55955d43a25f89'
  },
  'v0.11.1-beta.7': {
    'cli_Linux_x86_64.tar.gz':
      '5b5da8761e9f9be9b86377fa75e2f718a1be5bf0fecf83a5e7ae480f66a10301',
    'cli_Linux_arm64.tar.gz':
      '5e5202b46299e0f131a2f7fd010396c11490fa46b0113ef5b1a90c883c0691c0'
  },
  'v0.11.1-beta.6': {
    'cli_Linux_x86_64.tar.gz':
      '9d19a85374fb164e0a1976e5c693bbe2b11e48aca813b31c3ca867310808d2a0',
    'cli_Linux_arm64.tar.gz':
      '7f15a33c72b11b69ddfca6cc6018cff826fd9ce1f5b1f506e07eff0d9f1eed89'
  },
  'v0.11.1-beta.5': {
    'cli_Linux_x86_64.tar.gz':
      'de7e63283f4d6f99884af675079d04fd258ce75db43d2208aa0827fca5f0e904',
    'cli_Linux_arm64.tar.gz':
      'fdf56b9e6321a6d56807fede8ccca640f83e9901decbec1c67fb0ac09c598af0'
  },
  'v0.11.1-beta.4': {
    'cli_Linux_x86_64.tar.gz':
      '9cbd100236faa01edbcf3e58a940956f69482c3c1e2de3be3740def3d74f5988',
    'cli_Linux_arm64.tar.gz':
      'c41163f0341054444d33fe19ba3e9ba49f743a9187841ac255ca221b31eefe5d'
  },
  'v0.11.1-beta.3': {
    'cli_Linux_x86_64.tar.gz':
      '8acb4a973f71c23c384a6c3a9bbe5fa9f1b94c6a6b8a6f46c77a1798ea72e858',
    'cli_Linux_arm64.tar.gz':
      '4d9805907cc3633ba44b8acc2cf6973daa55cf998103bcf14a47188676496c3d'
  },
  'v0.11.1-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      'bd8417c66af7a2acf318907a12843ef03779a1cd5b2ab71436b282109344939f',
    'cli_Linux_arm64.tar.gz':
      '7aeb55c3ecf197b8d1f54129612d3e89858d122f95f63e5c40ceef9fe2ee3f65'
  },
  'v0.11.1-beta.10': {
    'cli_Linux_x86_64.tar.gz':
      'ef729c44750ef5451fbd4c0f9fe7e737073c9d5fd743009d727d40d3d9b55588',
    'cli_Linux_arm64.tar.gz':
      '29eb13b7bdfb458395816096628060ef82fb01ea1e7d4b600273c9986a968e00'
  },
  'v0.11.1-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '4e9a5767280880306f95eb56c1f1d2fff71429c089d085302324fbcafd4570d6',
    'cli_Linux_arm64.tar.gz':
      'cb02bb4fdee265c28f68b09c4ef2ce2babf40cb2a71985c73e4d64f04998a48a'
  },
  'v0.11.0': {
    'cli_Linux_x86_64.tar.gz':
      'a54447e3d5dbe4b9babcc175fec1e319cbb6c16e6b7fe7a3c0e07c9604655d25',
    'cli_Linux_arm64.tar.gz':
      '781f0805fcf33df2ff9a484fa6b1921ffeb5b57308d9812cc05ab7c551b8b11c'
  },
  'v0.11.0-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      'e8af90f7ea248bd4a84881541597c34a450533142840bc7136567cda8553c08a',
    'cli_Linux_arm64.tar.gz':
      '2cf6428253c33efabc7b686d03ed5c988894fe2f7a1669d1e78409115c27c8c6'
  },
  'v0.10.4-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      '4868e390270e55f57bfe2433ea58f6dc41a62ae0d0aa3dad5f5527c7147988a6',
    'cli_Linux_arm64.tar.gz':
      '1eb9a5bfd3e5efa119c736758611f8fa992b9cd2ca97267524c59b1909cbe8b3'
  },
  'v0.10.4-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '7a848b737ba56f2885e7a72d823612fe2173c9e41c2ae6fa486c9d9d87e2ce18',
    'cli_Linux_arm64.tar.gz':
      'd635d81f73b96bc601c8a7c4f54c1c565ea36c7b1acdad2690fff513aeb2dbf2'
  },
  'v0.10.3': {
    'cli_Linux_x86_64.tar.gz':
      'a390ac3934f2d3f3f9ab608c597606a0835dc337d97bc7760eb1b2391ff1674a',
    'cli_Linux_arm64.tar.gz':
      'b65a5ea80c3551684c444485cd0cd44c5a9c230d491ad7f68ad16334d8025f34'
  },
  'v0.10.3-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      'e0c3ed5aa54e565a6e72bff8a31c65c339b7e76f864fc3aa4bb3ddd5cdbcdcdd',
    'cli_Linux_arm64.tar.gz':
      '16cd69db42b51077954581d5efc5191d21cd69a1c4729b2294c3986a51634c88'
  },
  'v0.10.2': {
    'cli_Linux_x86_64.tar.gz':
      'c87b54a36eca63b956c6ed648026e36027061052967aa26dd7744badf9aa32a1',
    'cli_Linux_arm64.tar.gz':
      '76b726dc29716ecf0385a0b782582a12cd0210ad4469530010f262903777492b'
  },
  'v0.10.2-beta.4': {
    'cli_Linux_x86_64.tar.gz':
      'cef58038d54d183d5bd72e704e4f0e06b3cba24a13fbfd4efd046d4f863c1ce1',
    'cli_Linux_arm64.tar.gz':
      '6cfc19121e25a5d8e0f5a396bba56471c7cca36865c01e61acd5e114d4533351'
  },
  'v0.10.2-beta.3': {
    'cli_Linux_x86_64.tar.gz':
      '0075c528ce132b108dd62c0dcf7c125d62e692e38309002694b838409f0949e0',
    'cli_Linux_arm64.tar.gz':
      'cb2cd8094d7fa5120f99f62be9111e168225fefc1bff533ceccf7cf7d72ec45f'
  },
  'v0.10.2-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      'c2be5d3e4b937e5be5a58fa8719ebb21687b4f60cafead6345ebb60f0bdd14fa',
    'cli_Linux_arm64.tar.gz':
      'd9e35c1e2789830e01559ad4f173662ed3760b7e2636932fff24206b536c9cda'
  },
  'v0.10.2-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '4b904a84f5ca6985973ce4c995900b2c7811ded75c97e2650b8de8965e043843',
    'cli_Linux_arm64.tar.gz':
      'eb0611fca2d90ccc6d0f7ce7f3083b6f7f47296a08955a2156fb4ed37958cb58'
  },
  'v0.10.2-alpha.1': {
    'cli_Linux_x86_64.tar.gz':
      'c5cd74e102a49fe6a60cddaf0acee8612a640cae6ad1745081a73f3979d02dc0',
    'cli_Linux_arm64.tar.gz':
      'f3fd813c83b2a59f9f95a16595d42f68bb280170b1547531f9ca22bf5d129b77'
  },
  'v0.10.1': {
    'cli_Linux_x86_64.tar.gz':
      '8f077ba0d38ebc611f2379f2e1decb28bdb02ab5614fb9132bb0a4a9a96b7aa7',
    'cli_Linux_arm64.tar.gz':
      '5506a68a91e18c10ccb92852a488a494fcc891b646957ee6dd438003eb5ed615'
  },
  'v0.10.1-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '7845b9aecefd5ef79275ffbc2447bf8a4c1928c1cca1745922ad275823752fcb',
    'cli_Linux_arm64.tar.gz':
      '435c38e7b44c9a936a1244d4ea6ff980d155008065b935798ea145a7b229f412'
  },
  'v0.10.1-alpha.9': {
    'cli_Linux_x86_64.tar.gz':
      '6cd2d15b7e8d99fd28bc81c5d9127fdfb3b747bb694dd19dff0fa9943bb72d44',
    'cli_Linux_arm64.tar.gz':
      'a857ec8f1df05e52039cdd0533fc00d9280cfcdf38b67ed1a37ef56b2e8c66c3'
  },
  'v0.10.1-alpha.7': {
    'cli_Linux_x86_64.tar.gz':
      'ad917a0f2e043d1a71734a8d05fa858676deb3841f2debb04b8702d170d9ef69',
    'cli_Linux_arm64.tar.gz':
      'fdf863a2b9007847fb7fcaca9a6afc093f5b47e6daa9dbcc6467e88478647251'
  },
  'v0.10.1-alpha.6': {
    'cli_Linux_x86_64.tar.gz':
      'effcbfa1c78f321ca0a478f837c1330cf7b78bc7c2dfe33d805be4742f15767e',
    'cli_Linux_arm64.tar.gz':
      '5886acf8fb55816274c1123b703b3a31ee83239998ae86e02ca236ec86113b23'
  },
  'v0.10.1-alpha.5': {
    'cli_Linux_x86_64.tar.gz':
      'fdfad70fd62e3c9580ef93443ca7b2978d812de7d9dc0ac88c0ab1f29d18535f',
    'cli_Linux_arm64.tar.gz':
      '902fdd401e2bf1583ba4de67c3a9b1bc58fb8172a283aff7a111122c629b3460'
  },
  'v0.10.1-alpha.4': {
    'cli_Linux_x86_64.tar.gz':
      'd32e4c21a9be4ef8c475ed70a2bc1507a04efc9b04dabb0fd00d1ead8b15f30c',
    'cli_Linux_arm64.tar.gz':
      '846727deb88239b6c3d40abc3743ca18b7f16e64ef886fcb978ba0d1796afd4c'
  },
  'v0.10.1-alpha.3': {
    'cli_Linux_x86_64.tar.gz':
      '34708d6ca85cd7960504c198aba4e018791eb59b7b3c4764759c82535b39e186',
    'cli_Linux_arm64.tar.gz':
      'e0475a431ebaf2fa796907a38c4f6083d9ccaf9e41db00f8ab289920f2e6b55f'
  },
  'v0.10.0': {
    'cli_Linux_x86_64.tar.gz':
      '1e1a7e39f8e2fdb6d06bdfec1f180ecca08bb4f4eb97baf4cbfefc79783c3d7a',
    'cli_Linux_arm64.tar.gz':
      '7c7f4e07f791cbb83b1c7e4bec3a4dae24d40ac160962f0fd7ce725270f3b2e5'
  },
  'v0.10.0-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      '1173b49a0e72f107923ea00cb4348285dc5493781607e59591c8578ed9ff6c4f',
    'cli_Linux_arm64.tar.gz':
      '6d5354434f699953472cee86726f98ba3d5efabe8e7ec4e3bc093b521a474d3f'
  },
  'v0.10.0-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '36e3a6dba56dac73ded3e8d4ab447bc35afa4a46f6cbb8d29f8dea986e2427e3',
    'cli_Linux_arm64.tar.gz':
      'f0dd1ad5f6b79a81ce4fddeff629aab4234d91a25942edab3bf4d199f2869ba9'
  },
  'v0.9.2': {
    'cli_Linux_x86_64.tar.gz':
      '8a20147031a395e1410296fef440558250ccb0f2775c4aba894b0971e5407f81',
    'cli_Linux_arm64.tar.gz':
      'd614ff87d8d679a0982ccd3e140a876dfbdf9c1290dc4c1f2b4b584159832dc0'
  },
  'v0.9.1': {
    'cli_Linux_x86_64.tar.gz':
      '9aba636752a40ff70198eabb8f79217096d449af6a4db82040cfcf1864e7a57e',
    'cli_Linux_arm64.tar.gz':
      '991d33d5e8eb58f05623e1f36d0da034ae41c3b87e63fcd355373bb13342b47c'
  },
  'v0.9.1-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      '462c9805e0d035c07cecdea2945f1947ce279fa3e8cbf6fbaf9b560ca8467ab1',
    'cli_Linux_arm64.tar.gz':
      '1314eacebef59fbfcf9004bd9a8c1be28c0163d5a04fddb1237daa7c90fa3d6b'
  },
  'v0.9.1-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      'd70df6943520073bf7ec5aa56042774aa30cd8d2262505246e51509c22a2aa20',
    'cli_Linux_arm64.tar.gz':
      '4e10f9a1919cd0d152dc4a333add11138a8ab1db5b8783b0557646d7afb24d5b'
  },
  'v0.9.0': {
    'cli_Linux_x86_64.tar.gz':
      '80cd3e3fb375979cac9ac9d4c75a1e9016d2edd4ac6a1b5330284923eaa62971',
    'cli_Linux_arm64.tar.gz':
      'f056ebd816e00bc197d1d0fd6fac25e1351017fb95cea12a7ef3d78192a05aac'
  },
  'v0.9.0-beta.4': {
    'cli_Linux_x86_64.tar.gz':
      '9cd0d8c57890fb0aa63270cb0d4769f1fef39e16663f2a50431b6f4edf3eb9d9',
    'cli_Linux_arm64.tar.gz':
      'bc7c2c59cc789488a1eb883afe29222f485a23a187fd59a315f12367ea102251'
  },
  'v0.9.0-beta.3': {
    'cli_Linux_x86_64.tar.gz':
      'ec9ed73a7628d0d9273738340aaec4b8d8ac081f61cf427ba41b65fd13e7d512',
    'cli_Linux_arm64.tar.gz':
      '49e2bd2d234e68b6903d2ab19af870ac4bd972193aec3ecab4dc5a0446563884'
  },
  'v0.9.0-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      'eb4cef81590931fbbb86a0116df63c373d6da45ea498150a2db0453cd045dbca',
    'cli_Linux_arm64.tar.gz':
      'eb920b7088455dd4262d2e9e3207e0d67fd04911af557f4203877e0800562ad2'
  },
  'v0.9.0-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '6f576f57c2f0e635ff0b9ba35b281f720df561871e1f7d49ef69e1aaaa001d32',
    'cli_Linux_arm64.tar.gz':
      'c131fb6c333a31e402298e9866e81662901fcb7ef4dbf3a25c6d94ed3c978ba7'
  },
  'v0.9.0-alpha.3': {
    'cli_Linux_x86_64.tar.gz':
      '2d91bdd89973114ad9ab1d8648ed1c099c2596a2566df14227053ee29ffff98f',
    'cli_Linux_arm64.tar.gz':
      '6e9fa050ad4258510c8d9ea46ec8808119775c998f1f3d45e508cd15a97fe620'
  },
  'v0.8.0': {
    'cli_Linux_x86_64.tar.gz':
      '3a48bfc5564b765cf1a23fc874a2737a7b5b70c2926bd6bb37e281ad2fd0e41b',
    'cli_Linux_arm64.tar.gz':
      'c27aefc54d96d56dc9967048e2e4507601259efa7aa068e8526f953dd64be0fc'
  },
  'v0.8.0-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      'ae9018c7aa2175cd1b78251923ab8f15424fabc1561101ec79ef2251f4bbc85b',
    'cli_Linux_arm64.tar.gz':
      '3f6dc6ca2c4aec0f399702424cb7ba0fb3d9db7fc41119333362a9c90130c52f'
  },
  'v0.8.0-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      '4c6787624cfa11b0224a30a332af7faeb8ecdae11186980acc7f7dcab859c3bc',
    'cli_Linux_arm64.tar.gz':
      '2c4e5edc56995a36f8b7d317cb8fc91fb76ea2765c982055d73fcd316ca9d103'
  },
  'v0.7.0': {
    'cli_Linux_x86_64.tar.gz':
      '5a60c838bdace3bc084a9f3b1d27bf99304db4c2224a15b81534353ac28adf89',
    'cli_Linux_arm64.tar.gz':
      'ed1fe439e4134bf6262a0e36405445599086ad2b4af39da5ff12218276bb88ea'
  },
  'v0.7.0-rc.1': {
    'cli_Linux_x86_64.tar.gz':
      '4676a12089c28ac5ebc0a3e520a645e1bc007563e1065d0d0ec55e2803e723d2',
    'cli_Linux_arm64.tar.gz':
      'b0d2733635db9fd280b8b7e22268a13035a87f641bb15562c0c00d53561d7f54'
  },
  'v0.7.0-beta.8': {
    'cli_Linux_x86_64.tar.gz':
      'f22a11878a51462edd1c3d241986793f032db732c64ea9413ff0541b35c07bd1',
    'cli_Linux_arm64.tar.gz':
      '892d249891d83c9cc0fb33c1dff13e9e846595e03dd9ae35cac29ccf24efacb2'
  },
  'v0.7.0-beta.7': {
    'cli_Linux_x86_64.tar.gz':
      'b1d4b8f8aab66d93adaa31a04e0c089acf36d07285d975bb31de1c483947db33',
    'cli_Linux_arm64.tar.gz':
      'c14a586475cbea445a4b4bdb7a9cbf869442643cecbe9220a4aaa5be8e38c1ed'
  },
  'v0.7.0-beta.6': {
    'cli_Linux_x86_64.tar.gz':
      'ca0f880143cebb4ed65c2d38719e2a3c0a6fd83998e511b49e156ca9ff1338e2',
    'cli_Linux_arm64.tar.gz':
      'ce989a4e216abfacb75299f2c42b3147efa699e77cd55a1c25afea9f04649a83'
  },
  'v0.7.0-beta.5': {
    'cli_Linux_x86_64.tar.gz':
      'cf483caa2dc8f47f5fe5f6ab22fd2e225943a114c1b3d4e744d661390db4f8b9',
    'cli_Linux_arm64.tar.gz':
      '8e17b8c65395d52c3dbe77b6d4d4dd18eee3090ea8341810ae00407d030c4b85'
  },
  'v0.7.0-beta.4': {
    'cli_Linux_x86_64.tar.gz':
      '51297684a60cdce27904826b4e921bb79130f69f8a2b363ac59d8d3f30948a33',
    'cli_Linux_arm64.tar.gz':
      '6408f37d538751d5446434ac7e96d94b6132e51398b297d36ce500b8176f304d'
  },
  'v0.7.0-beta.3': {
    'cli_Linux_x86_64.tar.gz':
      '4e2cd6a4a1e95b7ba010024aebd1aebe992dc598de426b0bb53e3a78793a94ad',
    'cli_Linux_arm64.tar.gz':
      '43682fc5c0108e479e450708b98d88f6e5a39678d72437fcd73eb25f774d7426'
  },
  'v0.7.0-beta.2': {
    'cli_Linux_x86_64.tar.gz':
      'a574d4310a28d4e142f4d3b5efa06d5f5fc39a9d11f6db16274e7e65790019f8',
    'cli_Linux_arm64.tar.gz':
      '3e332b522648223840fafff273f0db646cdead1b7f62ab69fe4c1db81557a72d'
  },
  'v0.7.0-beta.1': {
    'cli_Linux_x86_64.tar.gz':
      'f15f7e6d5154f4dcb963f3e3a4472dcd1a551c448ae33125626a8250c840e307',
    'cli_Linux_arm64.tar.gz':
      '4e5b3cc1f60e43f58f08017a2dcf52fa66085fcd8469881276b8c98ad9107689'
  },
  'v0.6.3': {
    'cli_Linux_x86_64.tar.gz':
      'c8d15b0f8661bfed9128f6bb9ccd10e008474b7c8c6d55d64760621c872946ef',
    'cli_Linux_arm64.tar.gz':
      'f1069de5054fd29570522670ee523e2b1b5971ae5625481eddb44619bcf8cdd4'
  },
  'v0.6.2': {
    'cli_Linux_x86_64.tar.gz':
      '8af9c145bdce4c44d2d39d0e35472bd870814332ccc9b2f9438e0d50a8b19c17',
    'cli_Linux_arm64.tar.gz':
      'f8efa6a8a9ce3b5c8834d008a00139ee7793a358635d85bffe20ab6f04044736'
  },
  'v0.6.0': {
    'cli_Linux_x86_64.tar.gz':
      '53d239d2bc81fad88708a0f1572b2f06f99ddc11018e634d9bb787f7f6b3b0de',
    'cli_Linux_arm64.tar.gz':
      'f5bdfaa2a8f28aba346f51fafdeca36e6bbdc132ffe1e06d41f32c9a3972763b'
  },
  'v0.5.0': {
    'cli_Linux_x86_64.tar.gz':
      'ddfc68bcaafca07ab20bcd8f522f80aee0c8de82a869a02dc3f62d884a7ae347',
    'cli_Linux_arm64.tar.gz':
      'b38f82d70a1940c7c4f64881a639112dac97ff7a955292b1b76a4fa15d065d44'
  },
  'v0.4.2': {
    'cli_Linux_x86_64.tar.gz':
      'ce4e8103927037d8c0ff99050435e8215039760ad7c18a3821bbf6560ccb2510',
    'cli_Linux_arm64.tar.gz':
      'ce7eb90820f02f0de5f618a060a730a62b12ca83ad147a96bfb3f0d173af29bc'
  },
  'v0.4.1': {
    'cli_Linux_x86_64.tar.gz':
      'e232f6a2963e934d4d62b61de76226df8c02921448fb46196763c94d095b03f1',
    'cli_Linux_arm64.tar.gz':
      '90b1d63f3969d1d998ed52824aa3b0a09b493e92101bdd80e2bff878dc5426a4'
  },
  'v0.4.0': {
    'cli_Linux_x86_64.tar.gz':
      '578fbc1d258b46bd13c5ca3387cf33ffaed7681d82f2ab389dfdc93a1cb44366',
    'cli_Linux_arm64.tar.gz':
      'f5ea7b9a04e1b5611e4faff45e8d9f5a4627d8921e93904cb25666ea45a2d82a'
  },
  'v0.3.1': {
    'cli_Linux_x86_64.tar.gz':
      'f73d962831784f8d07c8ed6a1374556ee698967a36dfff9b5ed5a47d0e9b5b31',
    'cli_Linux_arm64.tar.gz':
      '6e3b9c61f45eb191cf1468db75f5e62e2aae4e8bc33a9bab81d56417adae9c8e'
  },
  'v0.3.0': {
    'cli_Linux_x86_64.tar.gz':
      '0bbaca300d3385462de43acb8f6ef384e7e63d0dc6fa0055a79cc06043c07ac1',
    'cli_Linux_arm64.tar.gz':
      '9ebf05914140ed50fc0cff661c983ecc7874f621ed601d701c0f637d99ee1ea3'
  },
  'v0.2.0': {
    'cli_Linux_x86_64.tar.gz':
      '0fc86ba3d9d99c8874da0d65622e6e118e0896432b42d42c131c79bc9e0466dd',
    'cli_Linux_arm64.tar.gz':
      '15670f3bf48ba5647fab5c47532dc2d42b62ea9a9bc0f8c26c52d2aad9b14c5f'
  },
  'v0.1.2': {
    'cli_Linux_x86_64.tar.gz':
      'fe9274374eafe760d7156436edb22ca6a0fbdb2d3856db239c8adac3d1e36d13',
    'cli_Linux_arm64.tar.gz':
      'deb09d58b73cb1978dcf05541224807bcac4f8a7f6112f6966e24f4369b78aaa'
  },
  'v0.1.1': {
    'cli_Linux_x86_64.tar.gz':
      '0bf02bde58b80714d775b5b5689cebffaeb6427f203719f3f0c106171160d123',
    'cli_Linux_arm64.tar.gz':
      'bd367c2d81d335b896a895704dabb6b89fb0c6230258b79c0fc122349eb8a812'
  },
  'v0.1.0': {
    'cli_Linux_x86_64.tar.gz':
      'e27e1b979c20cb8ef81dc313b0db1772f3c3fa50c33f58ac5280fd6c72e70c70',
    'cli_Linux_arm64.tar.gz':
      'b3c72ba2ae0d11681c746074eb6190ffdc9bad6e127eb8d08c7b40ba875d27f4'
  }
}

/**
 * Get the pinned SHA-256 for a release tarball
 */
export const getExpected = (version: string, asset: string): string => {
  const assets: Record<string, string> = Object.hasOwn(CHECKSUMS, version)
    ? CHECKSUMS[version]
    : {}
  const expected = Object.hasOwn(assets, asset) ? assets[asset] : undefined
  if (!expected) {
    throw new Error(
      `No pinned checksum for Miru CLI ${version} (${asset}). Pick a version that this release of mirurobotics/setup-cli lists, or upgrade the action.`
    )
  }
  return expected
}

/**
 * Check that a downloaded release tarball has the expected SHA-256
 */
export const verify = async (path: string, expected: string): Promise<void> => {
  const content = await fs.promises.readFile(path)
  const actual = crypto.createHash('sha256').update(content).digest('hex')
  if (actual !== expected) {
    throw new Error(
      `Checksum mismatch for ${path}: expected ${expected}, got ${actual}`
    )
  }
}
