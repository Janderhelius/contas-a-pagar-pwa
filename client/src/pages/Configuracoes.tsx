/**
 * Página Configuracoes - Gerenciar configurações, backup e segurança
 */

import { useState, useEffect } from 'react';
import { db, exportarDados, importarDados, limparBancoDados } from '@/lib/db';
import { hashSenha, verificarSenha } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Download, Upload, Trash2, Lock, Home } from 'lucide-react';
import { Link } from 'wouter';
import { Configuracoes as ConfiguracoesType } from '@/lib/types';

export default function Configuracoes() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesType | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [temaEscuro, setTemaEscuro] = useState(false);

  // Carrega configurações ao montar
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const config = await db.configuracoes.get('config');
        if (config) {
          setConfiguracoes(config);
          setNotificacoesAtivas(config.notificacoesAtivas);
          setTemaEscuro(config.temaEscuro);
        }
      } catch (erro) {
        console.error('Erro ao carregar configurações:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  const handleExportarJSON = async () => {
    try {
      const dados = await exportarDados();
      const json = JSON.stringify(dados, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contas-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso!');
    } catch (erro) {
      console.error('Erro ao exportar:', erro);
      toast.error('Erro ao exportar backup');
    }
  };

  const handleImportarJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const texto = await file.text();
      const dados = JSON.parse(texto);
      await importarDados(dados);
      toast.success('Dados importados com sucesso!');
      window.location.reload();
    } catch (erro) {
      console.error('Erro ao importar:', erro);
      toast.error('Erro ao importar arquivo');
    }
  };

  const handleAtualizarSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não conferem');
      return;
    }

    if (novaSenha.length < 4) {
      toast.error('Senha deve ter no mínimo 4 caracteres');
      return;
    }

    try {
      if (configuracoes?.senha && senhaAtual) {
        if (!verificarSenha(senhaAtual, configuracoes.senha)) {
          toast.error('Senha atual incorreta');
          return;
        }
      }

      const novaConfig = {
        ...configuracoes!,
        senha: hashSenha(novaSenha),
        atualizadoEm: new Date(),
      };

      await db.configuracoes.update('config', novaConfig);
      setConfiguracoes(novaConfig);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      toast.success('Senha atualizada com sucesso!');
    } catch (erro) {
      console.error('Erro ao atualizar senha:', erro);
      toast.error('Erro ao atualizar senha');
    }
  };

  const handleAtualizarNotificacoes = async () => {
    try {
      const novaConfig = {
        ...configuracoes!,
        notificacoesAtivas,
        atualizadoEm: new Date(),
      };

      await db.configuracoes.update('config', novaConfig);
      setConfiguracoes(novaConfig);
      toast.success('Configurações atualizadas!');
    } catch (erro) {
      console.error('Erro ao atualizar configurações:', erro);
      toast.error('Erro ao atualizar configurações');
    }
  };

  const handleLimparDados = async () => {
    if (confirm('ATENÇÃO: Isso vai deletar TODOS os dados do aplicativo. Tem certeza?')) {
      try {
        await limparBancoDados();
        toast.success('Dados deletados com sucesso!');
        window.location.reload();
      } catch (erro) {
        console.error('Erro ao limpar dados:', erro);
        toast.error('Erro ao limpar dados');
      }
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Início
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Segurança */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="senhaAtual">Senha Atual (se houver)</Label>
                <Input
                  id="senhaAtual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Deixe em branco se não houver senha"
                />
              </div>

              <div>
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                />
              </div>

              <div>
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>

              <Button onClick={handleAtualizarSenha}>
                Atualizar Senha
              </Button>
              <p className="text-xs text-gray-500">
                A senha protege o acesso ao aplicativo localmente. Não é sincronizada com nenhum servidor.
              </p>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notificacoes"
                  checked={notificacoesAtivas}
                  onCheckedChange={(checked) => setNotificacoesAtivas(checked as boolean)}
                />
                <Label htmlFor="notificacoes" className="cursor-pointer">
                  Ativar notificações do navegador
                </Label>
              </div>

              <Button onClick={handleAtualizarNotificacoes}>
                Salvar Configurações
              </Button>

              <p className="text-xs text-gray-500">
                Quando ativadas, você receberá notificações dos lembretes de contas a pagar.
              </p>
            </CardContent>
          </Card>

          {/* Backup e Restauração */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Backup e Restauração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Exportar Dados</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Baixe um arquivo JSON com todas as suas contas e lembretes para backup seguro.
                </p>
                <Button onClick={handleExportarJSON} className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar como JSON
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Importar Dados</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Restaure dados de um arquivo JSON exportado anteriormente.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportarJSON}
                    className="flex-1"
                  />
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Importar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-800">
                Essas ações são irreversíveis. Faça um backup antes de continuar.
              </p>
              <Button
                variant="destructive"
                onClick={handleLimparDados}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Todos os Dados
              </Button>
            </CardContent>
          </Card>

          {/* Informações */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">ℹ️ Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                • Todos os dados são armazenados localmente no seu navegador (IndexedDB)
              </p>
              <p>
                • Nenhum dado é enviado para servidores externos
              </p>
              <p>
                • Fazer backup regularmente é recomendado
              </p>
              <p>
                • Versão: 1.0.0 • PWA Enabled
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
