import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Política de Privacidade — Figurinhas Copa 2026",
  description:
    "Como coletamos, usamos e protegemos seus dados no controle de figurinhas da Copa 2026.",
};

const UPDATED_AT = "11 de junho de 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Política de Privacidade" updatedAt={UPDATED_AT}>
      <LegalSection title="1. Quem somos">
        <p>
          Esta Política de Privacidade descreve como o serviço{" "}
          <strong>Figurinhas Copa 2026</strong> (&quot;Plataforma&quot;, &quot;nós&quot;)
          trata dados pessoais quando você utiliza nosso site e funcionalidades
          relacionadas ao controle de álbum de figurinhas, álbuns compartilhados,
          galeria pública e pedidos de troca.
        </p>
      </LegalSection>

      <LegalSection title="2. Dados que coletamos">
        <p>Podemos tratar as seguintes categorias de dados:</p>
        <ul>
          <li>
            <strong>Dados de conta:</strong> nome, endereço de e-mail, foto de
            perfil (quando disponibilizados pelo provedor de login, como Google)
            e identificador interno da conta.
          </li>
          <li>
            <strong>Dados de autenticação:</strong> informações necessárias para
            login, sessão e verificação de e-mail, incluindo tokens gerenciados
            por provedores de autenticação.
          </li>
          <li>
            <strong>Dados de uso do álbum:</strong> figurinhas marcadas como
            possuídas, quantidade de repetidas publicadas, progresso do álbum e
            preferências de visualização.
          </li>
          <li>
            <strong>Dados de álbuns compartilhados:</strong> nome do álbum,
            participação em grupos, convites, papel (dono ou membro) e
            configuração de visibilidade na galeria pública.
          </li>
          <li>
            <strong>Dados de trocas:</strong> pedidos de troca enviados ou
            recebidos, figurinha solicitada, mensagem opcional e status do pedido.
          </li>
          <li>
            <strong>Dados locais no dispositivo:</strong> quando você usa a
            Plataforma sem login, parte das informações do álbum pode ser
            armazenada apenas no navegador (localStorage).
          </li>
          <li>
            <strong>Dados técnicos:</strong> logs básicos de acesso, endereço IP,
            tipo de navegador e informações necessárias para segurança e
            funcionamento do serviço.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Como usamos os dados">
        <p>Utilizamos os dados para:</p>
        <ul>
          <li>permitir o controle e sincronização do seu álbum de figurinhas;</li>
          <li>autenticar usuários e manter sessões seguras;</li>
          <li>habilitar álbuns compartilhados, convites e galeria pública;</li>
          <li>processar e exibir pedidos de troca entre usuários;</li>
          <li>melhorar a estabilidade, segurança e experiência de uso;</li>
          <li>cumprir obrigações legais e responder a solicitações válidas.</li>
        </ul>
        <p>
          Não vendemos seus dados pessoais. Não utilizamos seus dados para
          publicidade comportamental de terceiros.
        </p>
      </LegalSection>

      <LegalSection title="4. Bases legais (LGPD)">
        <p>
          Quando aplicável, o tratamento de dados pessoais pode se fundamentar
          em:
        </p>
        <ul>
          <li>
            <strong>Execução de contrato ou procedimentos preliminares:</strong>{" "}
            para prestar o serviço solicitado por você;
          </li>
          <li>
            <strong>Consentimento:</strong> quando exigido, por exemplo para
            login via terceiros ou comunicações opcionais;
          </li>
          <li>
            <strong>Legítimo interesse:</strong> para segurança, prevenção a
            fraudes e melhoria do serviço, respeitados seus direitos;
          </li>
          <li>
            <strong>Cumprimento de obrigação legal:</strong> quando exigido por
            lei ou autoridade competente.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Compartilhamento de dados">
        <p>Seus dados podem ser compartilhados nas seguintes situações:</p>
        <ul>
          <li>
            <strong>Com outros usuários da Plataforma:</strong> quando você
            participa de álbuns compartilhados, torna um álbum público na galeria
            ou publica repetidas, outras pessoas autorizadas podem ver
            informações relacionadas (nome, progresso agregado, repetidas
            publicadas e pedidos de troca).
          </li>
          <li>
            <strong>Com provedores de serviço:</strong> hospedagem, banco de
            dados, autenticação (por exemplo, Google), envio de e-mail e
            infraestrutura técnica, sempre na medida necessária para operar o
            serviço.
          </li>
          <li>
            <strong>Por exigência legal:</strong> quando necessário para cumprir
            lei, ordem judicial ou proteger direitos da Plataforma e de usuários.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Armazenamento e retenção">
        <p>
          Dados de conta e álbum sincronizados são armazenados em servidores de
          provedores de infraestrutura contratados. Dados locais permanecem no
          seu dispositivo até serem apagados por você ou pelo navegador.
        </p>
        <p>
          Mantemos os dados enquanto sua conta estiver ativa ou enquanto forem
          necessários para as finalidades descritas nesta política. Você pode
          solicitar exclusão conforme a seção de direitos abaixo.
        </p>
      </LegalSection>

      <LegalSection title="7. Segurança">
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger
          seus dados, incluindo controle de acesso, autenticação e comunicação
          segura quando aplicável. Nenhum sistema é totalmente imune a riscos;
          recomendamos o uso de senhas fortes e a proteção do seu dispositivo.
        </p>
      </LegalSection>

      <LegalSection title="8. Seus direitos">
        <p>
          Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
          você pode solicitar, quando aplicável:
        </p>
        <ul>
          <li>confirmação da existência de tratamento;</li>
          <li>acesso, correção ou atualização de dados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>portabilidade, quando cabível;</li>
          <li>informação sobre compartilhamentos;</li>
          <li>revogação de consentimento, quando o tratamento se basear nele.</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato pelo canal indicado na
          seção &quot;Contato&quot; abaixo. Podemos solicitar informações para
          confirmar sua identidade antes de atender pedidos.
        </p>
      </LegalSection>

      <LegalSection title="9. Crianças e adolescentes">
        <p>
          A Plataforma foi pensada para uso familiar. Recomendamos que menores
          utilizem o serviço com supervisão de pais ou responsáveis. Se você for
          responsável legal e acreditar que dados de um menor foram coletados
          indevidamente, entre em contato para avaliarmos a exclusão ou
          limitação do tratamento.
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies e tecnologias similares">
        <p>
          Utilizamos cookies e armazenamento local estritamente necessários para
          autenticação, preferências (como tema claro/escuro) e funcionamento do
          álbum. Você pode gerenciar cookies nas configurações do navegador,
          observando que algumas funcionalidades podem deixar de funcionar.
        </p>
      </LegalSection>

      <LegalSection title="11. Alterações desta política">
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. A data
          da última atualização será indicada no topo desta página. O uso
          continuado da Plataforma após alterações relevantes pode constituir
          ciência quanto à versão vigente.
        </p>
      </LegalSection>

      <LegalSection title="12. Contato">
        <p>
          Para dúvidas, solicitações ou reclamações relacionadas a privacidade e
          proteção de dados, entre em contato pelo e-mail de suporte informado
          no site ou pelos canais disponíveis na sua conta.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
