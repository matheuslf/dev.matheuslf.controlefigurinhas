import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Termos de Serviço — Figurinhas Copa 2026",
  description:
    "Termos e condições de uso do controle de figurinhas da Copa 2026.",
};

const UPDATED_AT = "11 de junho de 2026";

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Termos de Serviço" updatedAt={UPDATED_AT}>
      <LegalSection title="1. Aceitação dos termos">
        <p>
          Ao acessar ou utilizar o serviço <strong>Figurinhas Copa 2026</strong>
          (&quot;Plataforma&quot;), você concorda com estes Termos de Serviço. Se
          não concordar, não utilize a Plataforma.
        </p>
        <p>
          Estes termos complementam a nossa{" "}
          <Link href="/privacidade" className="text-primary underline-offset-4 hover:underline">
            Política de Privacidade
          </Link>
          , que descreve como tratamos dados pessoais.
        </p>
      </LegalSection>

      <LegalSection title="2. Descrição do serviço">
        <p>A Plataforma oferece ferramentas para:</p>
        <ul>
          <li>marcar e acompanhar figurinhas do álbum da Copa do Mundo 2026;</li>
          <li>salvar progresso localmente no navegador ou sincronizar com conta;</li>
          <li>criar e participar de álbuns compartilhados com outras pessoas;</li>
          <li>exibir álbuns públicos em galeria, quando habilitado;</li>
          <li>publicar repetidas e solicitar trocas com outros usuários.</li>
        </ul>
        <p>
          A Plataforma é um auxiliar digital de controle de coleção. Não vendemos
          figurinhas físicas, não intermediamos pagamentos e não garantimos a
          conclusão de trocas entre usuários.
        </p>
      </LegalSection>

      <LegalSection title="3. Elegibilidade e conta">
        <p>
          Você declara ter capacidade legal para aceitar estes termos ou utilizar
          a Plataforma com supervisão de responsável legal, quando aplicável.
        </p>
        <p>
          Ao criar conta ou autenticar-se, você é responsável por manter a
          confidencialidade das credenciais e por todas as atividades realizadas
          em sua conta. Notifique-nos imediatamente em caso de uso não
          autorizado.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso permitido">
        <p>Você concorda em utilizar a Plataforma de forma lícita e adequada, incluindo:</p>
        <ul>
          <li>fornecer informações verdadeiras, quando solicitadas;</li>
          <li>respeitar outros usuários em álbuns compartilhados e pedidos de troca;</li>
          <li>utilizar convites e códigos de acesso apenas conforme autorizado;</li>
          <li>publicar na galeria apenas conteúdos relacionados ao uso do álbum.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Condutas proibidas">
        <p>É proibido, entre outras condutas:</p>
        <ul>
          <li>
            usar a Plataforma para fraudes, assédio, discriminação ou condutas
            abusivas;
          </li>
          <li>
            tentar acessar dados, contas ou áreas restritas sem autorização;
          </li>
          <li>
            sobrecarregar, interferir ou comprometer a segurança da Plataforma;
          </li>
          <li>
            utilizar automações maliciosas, scraping abusivo ou engenharia
            reversa indevida;
          </li>
          <li>
            violar direitos de terceiros ou leis aplicáveis, incluindo marcas e
            propriedade intelectual de terceiros.
          </li>
        </ul>
        <p>
          Figurinhas, nomes de seleções e referências ao álbum oficial Panini
          pertencem aos seus respectivos titulares. A Plataforma não é afiliada,
          endossada ou patrocinada pela Panini ou pela FIFA.
        </p>
      </LegalSection>

      <LegalSection title="6. Álbuns compartilhados e galeria pública">
        <p>
          Donos de álbuns podem convidar membros, definir visibilidade na galeria
          e gerenciar participantes. Ao tornar um álbum público, você entende que
          informações agregadas do grupo (como progresso e repetidas publicadas)
          poderão ser visualizadas por outros usuários.
        </p>
        <p>
          Você é responsável pelos convites que compartilha e pelas permissões
          concedidas dentro do seu álbum. Podemos remover conteúdo ou restringir
          acesso em caso de violação destes termos.
        </p>
      </LegalSection>

      <LegalSection title="7. Pedidos de troca">
        <p>
          A funcionalidade de pedidos de troca facilita a comunicação entre
          usuários interessados em trocar figurinhas repetidas. A Plataforma:
        </p>
        <ul>
          <li>não garante que uma troca será aceita ou concluída;</li>
          <li>
            não se responsabiliza por acordos, encontros ou transferências
            físicas realizados fora da Plataforma;
          </li>
          <li>
            pode registrar status do pedido (pendente, aceito, recusado,
            cancelado) sem, por si só, transferir figurinhas físicas ou
            alterar automaticamente coleções, salvo quando explicitamente
            indicado em funcionalidade futura.
          </li>
        </ul>
        <p>
          Trocas físicas ocorrem por conta e risco dos participantes. Recomendamos
          cautela, especialmente em interações com desconhecidos.
        </p>
      </LegalSection>

      <LegalSection title="8. Propriedade intelectual">
        <p>
          A Plataforma, incluindo layout, código, textos e identidade visual
          próprios, é protegida por leis de propriedade intelectual. É concedida
          a você uma licença limitada, não exclusiva e revogável para uso pessoal
          e não comercial do serviço.
        </p>
        <p>
          Você mantém os direitos sobre o conteúdo que inserir (como nomes de
          álbum e mensagens), concedendo à Plataforma licença necessária para
          operar as funcionalidades descritas nestes termos.
        </p>
      </LegalSection>

      <LegalSection title="9. Disponibilidade e alterações">
        <p>
          Buscamos manter a Plataforma disponível, mas não garantimos
          funcionamento ininterrupto ou livre de erros. Podemos modificar,
          suspender ou descontinuar funcionalidades, total ou parcialmente, a
          qualquer momento.
        </p>
        <p>
          Podemos atualizar estes Termos de Serviço. Alterações relevantes serão
          indicadas pela data de atualização no topo desta página. O uso
          continuado após mudanças pode representar aceitação da nova versão.
        </p>
      </LegalSection>

      <LegalSection title="10. Isenção de garantias">
        <p>
          A Plataforma é fornecida &quot;no estado em que se encontra&quot; e
          &quot;conforme disponível&quot;, dentro dos limites permitidos pela
          lei. Não garantimos que o serviço atenderá a todas as expectativas ou
          que dados locais nunca serão perdidos — recomendamos login para
          sincronização na nuvem.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitação de responsabilidade">
        <p>
          Na máxima extensão permitida pela legislação aplicável, a Plataforma e
          seus operadores não serão responsáveis por danos indiretos, lucros
          cessantes, perda de dados ou prejuízos decorrentes de trocas entre
          usuários, uso indevido de convites ou indisponibilidade temporária do
          serviço.
        </p>
      </LegalSection>

      <LegalSection title="12. Encerramento">
        <p>
          Você pode deixar de usar a Plataforma a qualquer momento e, quando
          disponível, excluir ou sair de álbuns compartilhados conforme as
          opções da conta.
        </p>
        <p>
          Podemos suspender ou encerrar seu acesso se houver violação destes
          termos, risco à segurança ou exigência legal.
        </p>
      </LegalSection>

      <LegalSection title="13. Lei aplicável e foro">
        <p>
          Estes termos são regidos pelas leis da República Federativa do Brasil.
          Fica eleito o foro da comarca do domicílio do usuário consumidor, quando
          aplicável, ou outro foro competente previsto em lei.
        </p>
      </LegalSection>

      <LegalSection title="14. Contato">
        <p>
          Em caso de dúvidas sobre estes Termos de Serviço, utilize os canais de
          contato disponíveis no site ou na sua conta.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
